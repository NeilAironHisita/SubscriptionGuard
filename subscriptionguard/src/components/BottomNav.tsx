import React from 'react';

interface BottomNavProps {
  activeScreen: 'dashboard' | 'trials' | 'analytics' | 'database';
  onNavigate: (screen: 'dashboard' | 'trials' | 'analytics' | 'database') => void;
  trialsCount?: number;
  urgentCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
  urgentCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-3 py-2.5 bg-[#181C24]/95 backdrop-blur-lg border-t border-[#2D3748] rounded-t-2xl shadow-2xl md:hidden">
      {/* Dashboard (Active Pill Style) */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
          activeScreen === 'dashboard'
            ? 'bg-[#10B981] text-black font-bold px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
            : 'text-[#9CA3AF] hover:text-white px-3 py-1'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeScreen === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
          dashboard
        </span>
        <span className="text-[11px] mt-0.5 tracking-tight">Dashboard</span>
      </button>

      {/* Trials with urgent badge */}
      <button
        onClick={() => onNavigate('trials')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 relative ${
          activeScreen === 'trials'
            ? 'bg-[#10B981] text-black font-bold px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
            : 'text-[#9CA3AF] hover:text-white px-3 py-1'
        }`}
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeScreen === 'trials' ? "'FILL' 1" : "'FILL' 0" }}>
            timer
          </span>
          {urgentCount > 0 && activeScreen !== 'trials' && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping" />
          )}
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight">Trials</span>
      </button>

      {/* Analytics */}
      <button
        onClick={() => onNavigate('analytics')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
          activeScreen === 'analytics'
            ? 'bg-[#10B981] text-black font-bold px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
            : 'text-[#9CA3AF] hover:text-white px-3 py-1'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">
          analytics
        </span>
        <span className="text-[11px] mt-0.5 tracking-tight">Analytics</span>
      </button>

      {/* Database / Settings */}
      <button
        onClick={() => onNavigate('database')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
          activeScreen === 'database'
            ? 'bg-[#10B981] text-black font-bold px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
            : 'text-[#9CA3AF] hover:text-white px-3 py-1'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">
          settings
        </span>
        <span className="text-[11px] mt-0.5 tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
