import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 border-t border-slate-800">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-xl text-white">HealthReserve</span>
          </div>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
            The world's premium telemedicine platform connecting patients with top-tier verified specialists instantly.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Doctor Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-blue-400 transition-colors">HIPAA Compliance</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 HealthReserve Inc. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed for a healthier world.</p>
      </div>
    </footer>
  );
}
