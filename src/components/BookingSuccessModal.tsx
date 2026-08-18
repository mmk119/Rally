import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Booking } from '../types';

interface BookingSuccessModalProps {
  booking: Booking;
  onClose: () => void;
  onViewBookings: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  onClose,
  onViewBookings,
}) => {
  useEffect(() => {
    // Launch energetic celebration confetti with neon green & gold sparks
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#bef264', '#ffffff', '#5e851a', '#e1e3e0'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141A16] border border-[#bef264] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(190,242,100,0.25)] relative overflow-hidden flex flex-col gap-6">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#bef264]/20 border border-[#bef264] flex items-center justify-center text-[#bef264] shadow-[0_0_20px_rgba(190,242,100,0.4)]">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#bef264]">
              Match Confirmed
            </span>
            <h3 className="font-condensed text-2xl font-bold text-white">Court Reserved!</h3>
          </div>
        </div>

        {/* Digital Match Pass Ticket */}
        <div className="bg-[#0c0f0e] border border-[#232B27] rounded-xl p-4 flex flex-col gap-4 relative">
          <div className="flex justify-between items-start border-b border-[#232B27] pb-3">
            <div>
              <p className="text-[10px] text-[#c3c9b2] uppercase tracking-wider font-semibold">
                Venue & Court
              </p>
              <p className="font-condensed text-lg font-bold text-white">{booking.court}</p>
              <p className="text-xs text-[#c3c9b2]">Rally Pro Arena • Court Gate 01</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#c3c9b2] uppercase tracking-wider font-semibold">
                Session Start
              </p>
              <p className="font-condensed text-lg font-bold text-[#bef264]">{booking.dateTime}</p>
              <p className="text-xs text-[#c3c9b2]">{booking.durationMins} Minutes</p>
            </div>
          </div>

          {/* Add-ons list if any */}
          {booking.addOns && booking.addOns.length > 0 && (
            <div className="text-xs text-[#c3c9b2] flex items-center gap-1.5 bg-[#141A16] px-3 py-1.5 rounded-lg border border-[#232B27]">
              <span className="material-symbols-outlined text-[15px] text-[#bef264]">sports_tennis</span>
              <span>Included: {booking.addOns.join(', ')}</span>
            </div>
          )}

          {/* Barcode & Access Code */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[10px] text-[#5d6562] uppercase tracking-wider">Locker Access Code</p>
              <p className="font-mono text-sm font-bold text-white tracking-widest">#7924</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#5d6562] uppercase tracking-wider">Amount Paid</p>
              <p className="font-condensed text-base font-bold text-white">
                ${booking.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewBookings();
            }}
            className="flex-1 bg-[#bef264] text-[#0B0F0C] font-condensed text-base font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(190,242,100,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>View Match Pass</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-[#232B27] hover:border-[#bef264]/40 text-[#c3c9b2] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
