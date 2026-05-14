import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, Button } from '../components/ui/core';

export function ContactUs() {
  return (
    <div className="bg-slate-50 min-h-screen dark:bg-slate-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Get in Touch</h1>
          <p className="text-slate-500 dark:text-slate-400">Our support team is available 24/7 to assist you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Card className="p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white">Email Support</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-2">For general inquiries and technical support.</p>
                  <a href="mailto:support@healthreserve.app" className="text-blue-600 font-bold">support@healthreserve.app</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white">Emergency Hotline</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-2">For immediate booking assistance.</p>
                  <p className="text-blue-600 font-bold">+1 (800) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white">Headquarters</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    123 Innovation Drive<br />
                    Tech District, San Francisco<br />
                    CA 94105, USA
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 dark:text-white">Send us a message</h3>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-slate-300">Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-slate-300">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-slate-300">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" placeholder="How can we help?"></textarea>
                </div>
                <Button className="w-full py-4">Send Message</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
