import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenBooking: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenBooking,
}) => {
  return (
    <aside className="hidden md:flex flex-col h-screen py-6 bg-[#0c0f0e]/90 backdrop-blur-xl border-r border-[#232B27] w-64 shrink-0 z-40 relative select-none">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex flex-col items-center text-center">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer group flex flex-col items-center"
        >
          {/* Logo with Padel Crest */}
          <div className="w-14 h-14 mb-2 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#1B2320] to-[#0c0f0e] border border-[#232B27] p-2 group-hover:border-[#bef264]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC6TzUjpW-176c_qYruyifIo3Fev7hGbU9J5mU62Ro-YV0jGmuHZ2Y-M6sXe2ERidLbx46JECAYgNywvLfW4UB9WJrh4-li5daUWRWaqbxXjRUyGI-5-G1UvAwxxRhkk0WzEypOu1HIFtiUarmtg9gjUUHcem5sRgUGQKTDsBILvE5ayujVycYsLJ43bA9RnBBoQGLVD9YcQA0iQVsotf2OVF-G7tSq52S0V6bgIRaYYjOj-vTYu4oRp8K4fatNOF2"
              alt="Rally Logo"
              className="w-full h-full object-contain filter invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <h1 className="font-condensed text-2xl font-bold text-[#bef264] tracking-tight flex items-center gap-1.5">
            RALLY <span className="text-white text-base tracking-widest font-normal">PRO</span>
          </h1>
          <p className="text-[11px] text-[#c3c9b2] uppercase tracking-widest font-medium mt-0.5">
            Elite Tier Member
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5 px-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
            currentView === 'dashboard'
              ? 'bg-[#bef264]/10 text-[#bef264] border-r-4 border-[#bef264] shadow-[inset_0_0_15px_rgba(190,242,100,0.06)]'
              : 'text-[#c3c9b2] hover:bg-[#1B2320]/60 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="font-medium tracking-wide">Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('courts')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
            currentView === 'courts'
              ? 'bg-[#bef264]/10 text-[#bef264] border-r-4 border-[#bef264] shadow-[inset_0_0_15px_rgba(190,242,100,0.06)]'
              : 'text-[#c3c9b2] hover:bg-[#1B2320]/60 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: currentView === 'courts' ? "'FILL' 1" : "'FILL' 0" }}
          >
            sports_tennis
          </span>
          <span className="font-medium tracking-wide">Courts</span>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
            currentView === 'bookings'
              ? 'bg-[#bef264]/10 text-[#bef264] border-r-4 border-[#bef264] shadow-[inset_0_0_15px_rgba(190,242,100,0.06)]'
              : 'text-[#c3c9b2] hover:bg-[#1B2320]/60 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: currentView === 'bookings' ? "'FILL' 1" : "'FILL' 0" }}
          >
            event_available
          </span>
          <span className="font-medium tracking-wide">My Bookings</span>
        </button>

        <button
          onClick={() => onNavigate('rankings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
            currentView === 'rankings'
              ? 'bg-[#bef264]/10 text-[#bef264] border-r-4 border-[#bef264] shadow-[inset_0_0_15px_rgba(190,242,100,0.06)]'
              : 'text-[#c3c9b2] hover:bg-[#1B2320]/60 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: currentView === 'rankings' ? "'FILL' 1" : "'FILL' 0" }}
          >
            leaderboard
          </span>
          <span className="font-medium tracking-wide">Rankings</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
            currentView === 'settings'
              ? 'bg-[#bef264]/10 text-[#bef264] border-r-4 border-[#bef264] shadow-[inset_0_0_15px_rgba(190,242,100,0.06)]'
              : 'text-[#c3c9b2] hover:bg-[#1B2320]/60 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: currentView === 'settings' ? "'FILL' 1" : "'FILL' 0" }}
          >
            settings
          </span>
          <span className="font-medium tracking-wide">Settings</span>
        </button>
      </nav>

      {/* Action CTA & Footer */}
      <div className="px-3 mt-auto flex flex-col gap-3">
        <button
          onClick={onOpenBooking}
          className="w-full bg-[#bef264] text-[#0B0F0C] font-semibold text-sm py-3 rounded-lg hover:brightness-110 hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Book a Court</span>
        </button>

        <div className="border-t border-[#232B27] pt-3 flex flex-col gap-1">
          <button
            onClick={() => alert('Rally Concierge: Call +1 (800) 555-RALLY or message via Coach AI')}
            className="text-[#c3c9b2] flex items-center gap-3 px-3.5 py-2 rounded-lg hover:bg-[#1B2320]/60 hover:text-white transition-all text-sm w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>Support</span>
          </button>
          <button
            onClick={() => alert('Logged in as Elite Member (Mohammad Kassem)')}
            className="text-[#c3c9b2] flex items-center gap-3 px-3.5 py-2 rounded-lg hover:bg-[#1B2320]/60 hover:text-white transition-all text-sm w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
