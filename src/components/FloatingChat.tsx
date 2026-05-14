import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/core';
import ChatService, { ChatMessage, ChatContext } from '../services/chatService';

interface FloatingChatProps {
  doctor: any;
  reviews?: any[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function FloatingChat({ doctor, reviews = [], isOpen = true, onClose }: FloatingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && doctor) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        sender: 'ai',
        text: ChatService.getFallbackResponse({
          doctorName: doctor.name,
          specialization: doctor.specialization,
          experience: doctor.experience,
          rating: doctor.rating,
          reviewCount: doctor.reviewCount,
        }),
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, doctor]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage() {
    if (!inputValue.trim() || aiLoading || !doctor) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setAiLoading(true);

    try {
      const context: ChatContext = {
        doctorName: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        clinic: doctor.clinic,
        verified: doctor.verified,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        reviews: reviews
          .slice(0, 3)
          .map((r: any) => ({ comment: r.comment, rating: r.rating })),
      };

      const aiResponse = await ChatService.sendMessage(
        inputValue,
        context,
        messages
      );

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiResponse,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get response. Please try again.';
      setError(errorMessage);
      
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai',
          text: errorMessage,
          timestamp: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 w-96 h-[600px] rounded-lg shadow-2xl bg-white dark:bg-slate-900 flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white shrink-0">
        <div>
          <h3 className="font-semibold">Chat with AI</h3>
          <p className="text-xs text-blue-100">About Dr. {doctor?.name}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                msg.error
                  ? 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200 flex items-start gap-2'
                  : msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-600'
              }`}
            >
              {msg.error && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {aiLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2 border border-slate-200 dark:border-slate-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !aiLoading && inputValue.trim()) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={aiLoading}
          maxLength={500}
        />
        <Button
          onClick={handleSendMessage}
          disabled={aiLoading || !inputValue.trim()}
          className="px-3 py-2 shrink-0"
          variant="default"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default FloatingChat;
