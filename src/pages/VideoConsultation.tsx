import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/core';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Maximize, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function VideoConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    // In a real implementation using Twilio Video, you would disconnect the room here:
    // room.disconnect();
    
    // Redirect based on role
    if (user?.role === 'doctor') {
      navigate('/dashboard'); // Go back to dashboard to write prescription
    } else {
      navigate('/dashboard'); // Patient goes to dashboard to wait for prescription
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] p-4 md:p-6 flex flex-col lg:flex-row gap-6 bg-slate-900 text-white rounded-3xl overflow-hidden relative m-4 md:m-8">
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
        {/* Remote Video (Mock) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Placeholder for Twilio Video Track */}
          <div className="text-center text-white/50 animate-pulse">
            <Video size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold tracking-tight">Waiting for other participant...</p>
            <p className="text-sm">Room ID: {appointmentId}</p>
          </div>
        </div>

        {/* Local Video (Mock) */}
        <div className="absolute bottom-6 right-6 w-48 h-64 bg-slate-800 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl shadow-black/50 transition-all z-10">
           {isVideoOff ? (
             <div className="w-full h-full flex items-center justify-center bg-slate-900">
               <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                 <VideoOff className="text-slate-500" />
               </div>
             </div>
           ) : (
             <div className="w-full h-full bg-slate-700 flex items-center justify-center relative">
                {/* Local camera feed goes here */}
                <p className="text-xs font-bold text-white/50">You</p>
                {isMuted && (
                  <div className="absolute top-2 right-2 bg-rose-500/80 p-1.5 rounded-md">
                    <MicOff size={12} className="text-white" />
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-bold tracking-widest text-sm">{formatTime(callDuration)}</span>
            </div>
            <h2 className="text-xl font-bold">Consultation Room</h2>
          </div>
          <Button variant="ghost" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-md">
            <Maximize size={18} />
          </Button>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center gap-4 bg-gradient-to-t from-black/80 to-transparent z-10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          <button 
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 transition-all mx-4"
          >
            <PhoneOff size={28} />
          </button>

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isChatOpen ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            <MessageSquare size={24} />
          </button>

          <button className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Side Chat / Notes Panel */}
      {isChatOpen && (
        <div className="w-full lg:w-96 bg-slate-800 rounded-2xl flex flex-col border border-white/10 shadow-2xl transition-all">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-lg">In-Call Messages</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Mock messages */}
            <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
              <span className="font-bold text-white block mb-1">System</span>
              Connection established. Video and Audio are encrypted end-to-end.
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <Button size="sm">Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
