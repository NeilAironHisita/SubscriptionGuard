import React, { useState } from 'react';
import { DARK_PATTERN_GUIDES } from '../data/initialData';

interface DarkPatternOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  targetService?: string;
}

export const DarkPatternOverlay: React.FC<DarkPatternOverlayProps> = ({
  isOpen,
  onClose,
  targetService,
}) => {
  const [selectedService, setSelectedService] = useState<string>(
    targetService || 'Adobe Creative Cloud'
  );
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentGuide = DARK_PATTERN_GUIDES.find(
    (g) => g.service_name.toLowerCase() === selectedService.toLowerCase()
  ) || DARK_PATTERN_GUIDES[0];

  const handleCopyScript = () => {
    const script = `To Customer Support / Billing Department:
I am writing to formally request the immediate termination of my subscription for ${selectedService} effective today. Under the FTC Click-to-Cancel mandate and Regulation E, please cancel all recurring billing cycles, revoke direct debit authorization, and email confirmation of cancellation to my registered address. I decline all alternate retention offers, discounts, or pause suggestions.`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#1E2640] rounded-2xl border border-[#2D3748] max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#2D3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
              <span className="material-symbols-outlined text-xl">shield_with_heart</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Dark Pattern Cancellation Defense
              </h2>
              <p className="text-xs md:text-sm text-[#9CA3AF]">
                Bypass deceptive retention labyrinths, questionnaires, & forced calls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C24] border border-[#2D3748] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar border-b border-[#2D3748]/50">
          {DARK_PATTERN_GUIDES.map((g) => (
            <button
              key={g.guide_id}
              onClick={() => setSelectedService(g.service_name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedService === g.service_name
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
              }`}
            >
              {g.service_name}
            </button>
          ))}
        </div>

        {/* Guide Content */}
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Trap Alert */}
          <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span>
                Trap Pattern: {currentGuide.dark_pattern_type}
              </span>
              <span className="bg-[#EF4444] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                {currentGuide.severity} Severity
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#DFE2EE] mt-1.5 leading-relaxed">
              {currentGuide.overview}
            </p>
          </div>

          {/* Quick Counter-Strategy */}
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Fast-Track Bypass Strategy
            </span>
            <p className="text-xs md:text-sm text-[#DFE2EE] leading-relaxed">
              {currentGuide.quick_bypass_strategy}
            </p>
          </div>

          {/* Action Checklist */}
          <div>
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Execution Sequence
            </h4>
            <div className="space-y-2.5">
              {currentGuide.steps.map((s) => (
                <div key={s.number} className="flex gap-3 bg-[#181C24] p-3 rounded-xl border border-[#2D3748]">
                  <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {s.number}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs md:text-sm text-white">{s.title}</h5>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click FTC Revocation Script */}
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-[#2D3748]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[#10B981] text-sm">gavel</span>
                Legal "Click-to-Cancel" Revocation Script
              </span>
              <button
                onClick={handleCopyScript}
                className="text-xs bg-[#10B981] text-black font-bold px-3 py-1 rounded-md hover:bg-[#34D399] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                {copiedScript ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF] font-mono leading-relaxed bg-[#181C24] p-2.5 rounded border border-[#2D3748]">
              "Under FTC 16 CFR Part 425 & Regulation E, I formally revoke pre-authorized recurring charges for {selectedService}. Cancel all retainers immediately and send written confirmation."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2D3748] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#34D399] text-black font-bold text-xs rounded-xl shadow transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
