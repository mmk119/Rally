import React from 'react';
import { ViewMode } from '../types';

interface MobileHeaderProps {
  onToggleCoach: () => void;
  onNavigate: (view: ViewMode) => void;
  unreadCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleCoach,
  onNavigate,
}) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-16 bg-[#0B0F0C]/90 backdrop-blur-xl border-b border-[#232B27]">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-[#bef264] flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded bg-[#141A16] border border-[#232B27] p-1 flex items-center justify-center">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC6TzUjpW-176c_qYruyifIo3Fev7hGbU9J5mU62Ro-YV0jGmuHZ2Y-M6sXe2ERidLbx46JECAYgNywvLfW4UB9WJrh4-li5daUWRWaqbxXjRUyGI-5-G1UvAwxxRhkk0WzEypOu1HIFtiUarmtg9gjUUHcem5sRgUGQKTDsBILvE5ayujVycYsLJ43bA9RnBBoQGLVD9YcQA0iQVsotf2OVF-G7tSq52S0V6bgIRaYYjOj-vTYu4oRp8K4fatNOF2"
              alt="Rally Logo"
              className="w-full h-full object-contain filter invert opacity-90"
            />
          </div>
          <span className="font-condensed text-2xl font-bold tracking-tight text-[#bef264] italic">
            RALLY
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-[#e1e3e0]">
        <button
          onClick={onToggleCoach}
          title="Open AI Coach"
          className="p-1.5 rounded-lg bg-[#141A16] border border-[#232B27] text-[#bef264] hover:border-[#bef264] transition-colors relative"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264]"></span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="p-1.5 rounded-lg text-[#c3c9b2] hover:text-[#bef264] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">account_circle</span>
        </button>
      </div>
    </header>
  );
};

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 md:hidden bg-[#0c0f0e]/95 backdrop-blur-2xl border-t border-[#232B27] px-2 shadow-2xl">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
          currentView === 'dashboard' ? 'text-[#bef264]' : 'text-[#c3c9b2]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">dashboard</span>
        <span className="text-[11px] font-medium mt-0.5">Home</span>
      </button>

      <button
        onClick={() => onNavigate('courts')}
        className="flex flex-col items-center justify-center -top-3 relative scale-110 active:scale-95 transition-transform"
      >
        <div className="w-12 h-12 rounded-full bg-[#bef264] text-[#0B0F0C] flex items-center justify-center shadow-[0_0_15px_rgba(190,242,100,0.4)] border-2 border-[#0B0F0C]">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            sports_tennis
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#bef264] mt-0.5">Book</span>
      </button>

      <button
        onClick={() => onNavigate('bookings')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
          currentView === 'bookings' ? 'text-[#bef264]' : 'text-[#c3c9b2]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">event_available</span>
        <span className="text-[11px] font-medium mt-0.5">Bookings</span>
      </button>

      <button
        onClick={() => onNavigate('rankings')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
          currentView === 'rankings' ? 'text-[#bef264]' : 'text-[#c3c9b2]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">leaderboard</span>
        <span className="text-[11px] font-medium mt-0.5">Rankings</span>
      </button>
    </nav>
  );
};
