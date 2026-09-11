import React from 'react';
import { UserProfile, CurrencyCode } from '../types';

interface NavbarProps {
  userProfile: UserProfile;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  onToggleCurrency: (currency: CurrencyCode) => void;
  onOpenAddModal: () => void;
  activeScreen: string;
  onNavigate: (screen: 'dashboard' | 'trials' | 'analytics' | 'database') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  onOpenHelp,
  onOpenProfile,
  onToggleCurrency,
  activeScreen,
  onNavigate,
}) => {
  return (
    <header className="fixed top-0 w-full bg-[#0B0F17]/95 backdrop-blur-md flex justify-between items-center px-4 md:px-8 h-16 w-full z-40 border-b border-[#1E2640]/80">
      {/* Brand logo & name */}
      <div 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 text-[#10B981] hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          security
        </span>
        <span className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center">
          Subscription<span className="text-[#10B981]">Guard</span>
        </span>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
            activeScreen === 'dashboard'
              ? 'text-[#10B981] bg-[#10B981]/10 font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('trials')}
          className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
            activeScreen === 'trials'
              ? 'text-[#10B981] bg-[#10B981]/10 font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          Free Trials
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
            activeScreen === 'analytics'
              ? 'text-[#10B981] bg-[#10B981]/10 font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          Analytics & Value
        </button>
        <button
          onClick={() => onNavigate('database')}
          className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
            activeScreen === 'database'
              ? 'text-[#10B981] bg-[#10B981]/10 font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">database</span>
          Relational DB
        </button>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-[#1E2640] p-0.5 rounded-lg border border-[#2D3748] text-xs font-semibold">
          <button
            onClick={() => onToggleCurrency('PHP')}
            className={`px-2 py-1 rounded transition-colors ${
              userProfile.currency === 'PHP'
                ? 'bg-[#10B981] text-black font-bold shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
            title="Switch to Philippine Peso"
          >
            ₱ PHP
          </button>
          <button
            onClick={() => onToggleCurrency('USD')}
            className={`px-2 py-1 rounded transition-colors ${
              userProfile.currency === 'USD'
                ? 'bg-[#10B981] text-black font-bold shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
            title="Switch to US Dollar"
          >
            $ USD
          </button>
        </div>

        {/* Universal Dark Pattern Help Button */}
        <button
          onClick={onOpenHelp}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1E2640] border border-[#2D3748] text-[#10B981] hover:bg-[#10B981]/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Universal Dark Pattern Cancellation Guide & Tips"
          aria-label="Universal Dark Pattern Cancellation Guide"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="relative w-9 h-9 rounded-full overflow-hidden border border-[#2D3748] hover:border-[#10B981] transition-all hover:scale-105 active:scale-95 flex items-center justify-center bg-[#1E2640]"
          title="Manage User Profile & Bank Connection"
        >
          {userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="material-symbols-outlined text-[#9CA3AF] text-sm">person</span>
          )}
          {userProfile.bank_connected && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full ring-2 ring-[#0B0F17]" />
          )}
        </button>
      </div>
    </header>
  );
};
