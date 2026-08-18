import React, { useState } from 'react';
import { Booking } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  onNavigateToCourts: () => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onNavigateToCourts,
  onCancelBooking,
}) => {
  const [selectedPass, setSelectedPass] = useState<Booking | null>(bookings[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyInvite = (id: string) => {
    navigator.clipboard.writeText(`https://rally.club/match/${id}?join=true`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-condensed text-3xl md:text-4xl font-bold tracking-tight text-white">
            My Court Bookings
          </h2>
          <p className="text-sm text-[#c3c9b2] mt-0.5">
            Manage your upcoming matches, match passes, and player invites.
          </p>
        </div>

        <button
          onClick={onNavigateToCourts}
          className="bg-[#bef264] text-[#0B0F0C] font-semibold text-xs py-2.5 px-4 rounded-lg hover:brightness-110 shadow-[0_0_15px_rgba(190,242,100,0.25)] transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Book New Slot</span>
        </button>
      </div>

      {/* Grid: Left List + Right Digital Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-semibold text-white text-sm tracking-wide">Active & Recent Matches</h3>

          {bookings.map((booking) => {
            const isSelected = selectedPass?.id === booking.id;
            return (
              <div
                key={booking.id}
                onClick={() => setSelectedPass(booking)}
                className={`bg-[#141A16]/90 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#bef264] shadow-[0_0_20px_rgba(190,242,100,0.12)] bg-[#1B2320]/80'
                    : 'border-[#232B27] hover:border-[#bef264]/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0c0f0e] border border-[#232B27] flex items-center justify-center text-[#bef264] shrink-0">
                    <span className="material-symbols-outlined text-[24px]">sports_tennis</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-condensed text-xl font-bold text-white">
                        {booking.court}
                      </h4>
                      {booking.status === 'CONFIRMED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30">
                          CONFIRMED
                        </span>
                      )}
                      {booking.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#444b46]/40 text-[#c2c8c1] border border-[#444b46]">
                          PENDING
                        </span>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30">
                          CANCELLED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#c3c9b2] mt-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#bef264]">schedule</span>
                      <span>{booking.dateTime} ({booking.durationMins}m)</span>
                    </p>

                    {booking.addOns && booking.addOns.length > 0 && (
                      <p className="text-[11px] text-[#5d6562] mt-1">
                        + {booking.addOns.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right metadata & actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-[#232B27] pt-3 sm:pt-0">
                  <span className="font-condensed text-xl font-bold text-white">
                    ${booking.amount.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyInvite(booking.id);
                      }}
                      className="px-2.5 py-1 rounded bg-[#1B2320] border border-[#232B27] hover:border-[#bef264]/50 text-xs text-[#c3c9b2] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">share</span>
                      <span>{copiedId === booking.id ? 'Copied!' : 'Invite'}</span>
                    </button>

                    {booking.status !== 'CANCELLED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Cancel this court reservation?')) {
                            onCancelBooking(booking.id);
                          }
                        }}
                        className="px-2 py-1 rounded hover:bg-[#ffb4ab]/10 text-xs text-[#ffb4ab] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Digital Match Pass / QR Showcase */}
        {selectedPass && (
          <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-6 flex flex-col gap-5 sticky top-6 h-fit shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232B27] pb-3">
              <span className="text-xs text-[#bef264] uppercase font-bold tracking-widest">
                Digital Pass
              </span>
              <span className="material-symbols-outlined text-[#c3c9b2] text-[18px]">
                contactless
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Stylized QR Box */}
              <div className="w-36 h-36 bg-white p-3 rounded-xl shadow-[0_0_25px_rgba(190,242,100,0.2)] flex items-center justify-center relative my-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    selectedPass.qrCode || 'RALLY-ARENA-PASS'
                  )}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-mono text-xs text-[#bef264] tracking-widest mt-2">
                {selectedPass.qrCode || 'RALLY-PASS-KEY'}
              </p>
              <p className="text-[11px] text-[#5d6562] mt-0.5">Scan at Court Gate Turnstile</p>
            </div>

            <div className="bg-[#0c0f0e] rounded-lg p-3.5 border border-[#232B27] flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-[#c3c9b2]">
                <span>Court Assignment</span>
                <span className="font-bold text-white">{selectedPass.court}</span>
              </div>
              <div className="flex justify-between text-[#c3c9b2]">
                <span>Session Time</span>
                <span className="font-bold text-white">{selectedPass.dateTime}</span>
              </div>
              <div className="flex justify-between text-[#c3c9b2]">
                <span>Turnstile Status</span>
                <span className="text-[#bef264] font-semibold">Authorized</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Calendar event generated for ${selectedPass.court} on ${selectedPass.dateTime}`)}
              className="w-full bg-[#1B2320] border border-[#232B27] hover:border-[#bef264] text-white text-xs font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#bef264]">
                calendar_add_on
              </span>
              <span>Add to Apple / Google Calendar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
