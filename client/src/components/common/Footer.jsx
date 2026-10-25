import React from 'react';
import { Recycle, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900">
                Eco<span className="text-brand-600">Track</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Smart municipal waste reporting, verified collection management, and community recycling rewards.
              Built with MERN Stack architecture for sustainability and operational efficiency.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-200 font-medium">
              <Shield className="w-3.5 h-3.5 text-brand-700" />
              <span>B.Tech CSE & ICTAK Full-Stack Evaluation Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Resident Links</h5>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/reports/new" className="hover:text-brand-700 transition-colors">Report Waste</Link></li>
              <li><Link to="/pickups" className="hover:text-brand-700 transition-colors">Request Pickup</Link></li>
              <li><Link to="/rewards" className="hover:text-brand-700 transition-colors">Rewards Leaderboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-700 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* System & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Platform</h5>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-brand-700 transition-colors">System Health API</a></li>
              <li><Link to="/admin" className="hover:text-brand-700 transition-colors">Admin Portal</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-700 transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EcoTrack Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with passion for a greener planet</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
