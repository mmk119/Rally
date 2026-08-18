import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [lightingPreset, setLightingPreset] = useState<'match' | 'ambient' | 'eco'>('match');
  const [autoRecord, setAutoRecord] = useState(true);
  const [autoScoreboard, setAutoScoreboard] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="font-condensed text-3xl md:text-4xl font-bold tracking-tight text-white">
          Member Settings
        </h2>
        <p className="text-sm text-[#c3c9b2] mt-0.5">
          Customize your court lighting preferences, automated match recording, and membership perks.
        </p>
      </div>

      {/* Elite Membership Card */}
      <div className="bg-gradient-to-r from-[#141A16] via-[#1B2320] to-[#141A16] border border-[#bef264]/50 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(190,242,100,0.1)]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0c0f0e] border border-[#bef264] flex items-center justify-center text-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.3)]">
              <span className="material-symbols-outlined text-[30px]">workspace_premium</span>
            </div>
            <div>
              <span className="text-[10px] text-[#bef264] uppercase font-bold tracking-widest">
                Tier Status
              </span>
              <h3 className="font-condensed text-2xl font-bold text-white">Elite Pro Member</h3>
              <p className="text-xs text-[#c3c9b2]">Member ID: #RLY-8849-ELITE • Valid thru Dec 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#bef264]/20 border border-[#bef264]/40 text-[#bef264] px-3 py-1 rounded-full text-xs font-bold">
              VIP Locker #14 Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Court Smart Preferences */}
      <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-6 flex flex-col gap-6">
        <h3 className="font-semibold text-white text-base">Court Arena Automation</h3>

        {/* Lighting presets */}
        <div>
          <label className="text-xs font-medium text-[#c3c9b2] block mb-2">
            Default Arena Lighting Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setLightingPreset('match')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                lightingPreset === 'match'
                  ? 'bg-[#bef264]/10 border-[#bef264] text-white shadow-[0_0_15px_rgba(190,242,100,0.15)]'
                  : 'bg-[#0c0f0e] border-[#232B27] text-[#c3c9b2] hover:border-[#bef264]/40'
              }`}
            >
              <span className="font-condensed text-base font-bold text-white flex items-center justify-between">
                <span>Match Pro 1000 Lux</span>
                {lightingPreset === 'match' && (
                  <span className="material-symbols-outlined text-[#bef264] text-[16px]">check</span>
                )}
              </span>
              <span className="text-[11px] text-[#c3c9b2]">Broadcasting level, zero-glare white light</span>
            </button>

            <button
              onClick={() => setLightingPreset('ambient')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                lightingPreset === 'ambient'
                  ? 'bg-[#bef264]/10 border-[#bef264] text-white shadow-[0_0_15px_rgba(190,242,100,0.15)]'
                  : 'bg-[#0c0f0e] border-[#232B27] text-[#c3c9b2] hover:border-[#bef264]/40'
              }`}
            >
              <span className="font-condensed text-base font-bold text-white flex items-center justify-between">
                <span>Warm Arena 750 Lux</span>
                {lightingPreset === 'ambient' && (
                  <span className="material-symbols-outlined text-[#bef264] text-[16px]">check</span>
                )}
              </span>
              <span className="text-[11px] text-[#c3c9b2]">Soft twilight tone with perimeter backlights</span>
            </button>

            <button
              onClick={() => setLightingPreset('eco')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                lightingPreset === 'eco'
                  ? 'bg-[#bef264]/10 border-[#bef264] text-white shadow-[0_0_15px_rgba(190,242,100,0.15)]'
                  : 'bg-[#0c0f0e] border-[#232B27] text-[#c3c9b2] hover:border-[#bef264]/40'
              }`}
            >
              <span className="font-condensed text-base font-bold text-white flex items-center justify-between">
                <span>Club Night Mode</span>
                {lightingPreset === 'eco' && (
                  <span className="material-symbols-outlined text-[#bef264] text-[16px]">check</span>
                )}
              </span>
              <span className="text-[11px] text-[#c3c9b2]">Focused court illumination, dim side seating</span>
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-4 border-t border-[#232B27] pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">4K Panoramic Match Recording</p>
              <p className="text-xs text-[#c3c9b2]">
                Automatically record sessions and generate rally highlight clips sent to your phone.
              </p>
            </div>
            <button
              onClick={() => setAutoRecord(!autoRecord)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoRecord ? 'bg-[#bef264]' : 'bg-[#272B29]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0B0F0C] transition-transform absolute top-1 ${
                  autoRecord ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">AI Vision Scoreboard Tracker</p>
              <p className="text-xs text-[#c3c9b2]">
                Track games, unforced errors, and smash speeds on the court digital LED display.
              </p>
            </div>
            <button
              onClick={() => setAutoScoreboard(!autoScoreboard)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoScoreboard ? 'bg-[#bef264]' : 'bg-[#272B29]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0B0F0C] transition-transform absolute top-1 ${
                  autoScoreboard ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">SMS Gate Turnstile Pin</p>
              <p className="text-xs text-[#c3c9b2]">
                Receive instant SMS with guest QR passes 30 minutes before match time.
              </p>
            </div>
            <button
              onClick={() => setSmsReminders(!smsReminders)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                smsReminders ? 'bg-[#bef264]' : 'bg-[#272B29]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0B0F0C] transition-transform absolute top-1 ${
                  smsReminders ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
