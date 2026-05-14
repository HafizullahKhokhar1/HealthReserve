import React, { useState } from 'react';
import { Card } from '../components/ui/core';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "Simply search for a doctor by specialization, select an available time slot from their profile, and confirm your booking. You will need to be logged in to complete the process."
  },
  {
    question: "Are the video calls secure?",
    answer: "Yes, all video consultations are fully encrypted end-to-end and comply with healthcare privacy standards like HIPAA."
  },
  {
    question: "How do I get my prescription?",
    answer: "After your consultation is completed, the doctor will generate a digital prescription which will be available in your Medical Vault. You can download it as a PDF."
  },
  {
    question: "Can I cancel or reschedule?",
    answer: "Yes, you can cancel or reschedule from your Patient Dashboard. Please note that cancellations must be made at least 24 hours in advance for a full refund."
  },
  {
    question: "How are doctors verified?",
    answer: "Our administrative team manually verifies the medical licenses, educational background, and identity of every doctor before they are allowed to accept appointments on HealthReserve."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-slate-50 min-h-screen dark:bg-slate-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know about using HealthReserve.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className={`!p-6 cursor-pointer transition-all ${openIndex === index ? 'border-blue-500 shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-600'}`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white">{faq.question}</h3>
                {openIndex === index ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-400" />}
              </div>
              {openIndex === index && (
                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
