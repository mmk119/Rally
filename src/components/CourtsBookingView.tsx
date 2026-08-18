import React, { useState } from 'react';
import { Court, TimeSlot, AddOnOption, Booking } from '../types';
import { COURTS_DATA, INITIAL_TIME_SLOTS, INITIAL_ADD_ONS } from '../data/mockData';

interface CourtsBookingViewProps {
  onBookingConfirmed: (newBooking: Booking) => void;
  selectedCourtId?: string;
  selectedTimeSlot?: string;
}

export const CourtsBookingView: React.FC<CourtsBookingViewProps> = ({
  onBookingConfirmed,
  selectedCourtId = 'c1',
  selectedTimeSlot = '19:00',
}) => {
  const [selectedDate, setSelectedDate] = useState<{ day: string; dateNum: number; fullDate: string }>({
    day: 'Wed',
    dateNum: 13,
    fullDate: 'Wed, Oct 13',
  });

  const [selectedTime, setSelectedTime] = useState<string>(selectedTimeSlot);
  const [selectedCourt, setSelectedCourt] = useState<Court>(
    COURTS_DATA.find((c) => c.id === selectedCourtId) || COURTS_DATA[0]
  );
  const [addOns, setAddOns] = useState<AddOnOption[]>(INITIAL_ADD_ONS);
  const [durationMins, setDurationMins] = useState<number>(90);

  const dateOptions = [
    { day: 'Tue', dateNum: 12, fullDate: 'Tue, Oct 12' },
    { day: 'Wed', dateNum: 13, fullDate: 'Wed, Oct 13' },
    { day: 'Thu', dateNum: 14, fullDate: 'Thu, Oct 14' },
    { day: 'Fri', dateNum: 15, fullDate: 'Fri, Oct 15' },
    { day: 'Sat', dateNum: 16, fullDate: 'Sat, Oct 16' },
  ];

  const handleToggleAddOn = (id: string) => {
    setAddOns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const calculateEndTime = (start: string, duration: number) => {
    const [hours, mins] = start.split(':').map(Number);
    const totalMins = hours * 60 + mins + duration;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  // Base price calculation (adjust based on duration)
  const baseCourtPrice = (selectedCourt.pricePerHour * durationMins) / 60;
  const addOnsTotal = addOns.filter((a) => a.selected).reduce((acc, curr) => acc + curr.price, 0);
  const totalPrice = baseCourtPrice + addOnsTotal;

  const handleConfirm = () => {
    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      player: 'Mohammad K. (You)',
      court: selectedCourt.name,
      courtId: selectedCourt.id,
      dateTime: `${selectedDate.fullDate}, ${selectedTime}`,
      rawDate: `2026-10-${selectedDate.dateNum}`,
      timeSlot: selectedTime,
      durationMins,
      amount: totalPrice,
      status: 'CONFIRMED',
      addOns: addOns.filter((a) => a.selected).map((a) => a.name),
      qrCode: `RALLY-${selectedCourt.id.toUpperCase()}-${selectedTime.replace(':', '')}-MOHAMMADK`,
    };

    onBookingConfirmed(newBooking);
  };

  const morningSlots = INITIAL_TIME_SLOTS.filter((s) => s.period === 'morning');
  const afternoonSlots = INITIAL_TIME_SLOTS.filter((s) => s.period === 'afternoon');
  const eveningSlots = INITIAL_TIME_SLOTS.filter((s) => s.period === 'evening');

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1600px] mx-auto w-full">
      {/* Background tennis ball atmospheric artwork */}
      <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none mix-blend-screen">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUcfOTJl4BPoFNLnkmv8JdBO7Ym2v5zPEsw_kNOw9V6--6VqgVg7FxClfLLFqAL2pjU9jPf7IZ89Bft5dMLQr7AbU1afy_ps0vUfeD-ljQxH4qnfYbrpLicskAilPZJ_LCfGi1KxCMXvh4SH2uwuejPR2C3uRWu7-JoQkUJPScI672nQWNA5dLZKD5gJWzlL1JyyYl_v4dPWmieiS7D_bmP5m2LQwc0ShF-CLuQHa_Ey6M3BMxJw0Btn_jyxGpBS5_"
          alt="Tennis court background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Booking Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 pb-32 lg:pb-12 flex flex-col gap-8">
        {/* Header */}
        <div>
          <h2 className="font-condensed text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            Reserve a Court
          </h2>
          <p className="text-sm md:text-base text-[#c3c9b2] mt-1 max-w-2xl">
            Select your preferred time slot and court for today. Peak hours are indicated with high demand markers.
          </p>
        </div>

        {/* Progress Tracker Column */}
        <div className="relative ml-2 pl-6 md:ml-4 md:pl-8 border-l-2 border-[#232B27]/60 flex flex-col gap-10">
          {/* STEP 1: Date & Time Selection */}
          <section className="flex flex-col gap-5 relative">
            <div className="absolute -left-[35px] md:-left-[43px] top-0.5 w-8 h-8 rounded-full bg-[#bef264] text-[#0B0F0C] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(190,242,100,0.4)] z-10">
              1
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="font-condensed text-2xl font-bold text-white">Time Selection</h3>
                <p className="text-xs text-[#c3c9b2]">Select date and 90-minute session start time</p>
              </div>

              {/* Date Picker Mini */}
              <div className="flex gap-2">
                {dateOptions.map((d) => {
                  const isSelected = selectedDate.dateNum === d.dateNum;
                  return (
                    <button
                      key={d.dateNum}
                      onClick={() => setSelectedDate(d)}
                      className={`px-3.5 py-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#141A16] border border-[#bef264] text-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.2)] scale-105'
                          : 'bg-[#141A16]/80 border border-[#232B27] text-white opacity-70 hover:opacity-100 hover:border-[#bef264]/40'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#c3c9b2]">
                        {d.day}
                      </span>
                      <span className="font-condensed text-lg font-bold">{d.dateNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Grid with Periods */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 pt-2">
              {/* Morning */}
              <div className="col-span-full border-b border-[#232B27]/80 pb-1.5 flex items-center gap-2 text-xs font-medium text-[#c3c9b2]">
                <span className="material-symbols-outlined text-[16px] text-[#bef264]">wb_twilight</span>
                <span>Morning</span>
              </div>

              {morningSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                if (!slot.available) {
                  return (
                    <button
                      key={slot.time}
                      disabled
                      className="slot-occupied py-3 rounded-lg flex flex-col items-center justify-center select-none"
                    >
                      <span className="text-sm font-semibold">{slot.time}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 rounded-lg flex flex-col items-center justify-center relative cursor-pointer ${
                      isSelected ? 'slot-selected' : 'slot-available'
                    }`}
                  >
                    <span className="text-sm font-semibold">{slot.time}</span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 material-symbols-outlined text-[10px] bg-[#bef264] text-[#0B0F0C] rounded-full p-0.5 border border-[#0B0F0C] font-bold">
                        check
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Afternoon */}
              <div className="col-span-full mt-3 border-b border-[#232B27]/80 pb-1.5 flex items-center gap-2 text-xs font-medium text-[#c3c9b2]">
                <span className="material-symbols-outlined text-[16px] text-[#bef264]">light_mode</span>
                <span>Afternoon</span>
              </div>

              {afternoonSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                if (!slot.available) {
                  return (
                    <button
                      key={slot.time}
                      disabled
                      className="slot-occupied py-3 rounded-lg flex flex-col items-center justify-center select-none"
                    >
                      <span className="text-sm font-semibold">{slot.time}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 rounded-lg flex flex-col items-center justify-center relative cursor-pointer group ${
                      isSelected ? 'slot-selected' : 'slot-available'
                    }`}
                  >
                    <span className="text-sm font-semibold">{slot.time}</span>
                    {slot.highDemand && !isSelected && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264] animate-pulse"
                        title="High Demand Slot"
                      />
                    )}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 material-symbols-outlined text-[10px] bg-[#bef264] text-[#0B0F0C] rounded-full p-0.5 border border-[#0B0F0C] font-bold">
                        check
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Evening */}
              <div className="col-span-full mt-3 border-b border-[#232B27]/80 pb-1.5 flex items-center gap-2 text-xs font-medium text-[#c3c9b2]">
                <span className="material-symbols-outlined text-[16px] text-[#bef264]">dark_mode</span>
                <span>Evening</span>
              </div>

              {eveningSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                if (!slot.available) {
                  return (
                    <button
                      key={slot.time}
                      disabled
                      className="slot-occupied py-3 rounded-lg flex flex-col items-center justify-center select-none"
                    >
                      <span className="text-sm font-semibold">{slot.time}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 rounded-lg flex flex-col items-center justify-center relative cursor-pointer group ${
                      isSelected ? 'slot-selected' : 'slot-available'
                    }`}
                  >
                    <span className="text-sm font-semibold">{slot.time}</span>
                    {slot.highDemand && !isSelected && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264] animate-pulse"
                        title="High Demand Slot"
                      />
                    )}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 material-symbols-outlined text-[10px] bg-[#bef264] text-[#0B0F0C] rounded-full p-0.5 border border-[#0B0F0C] font-bold">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: Court Assignment */}
          <section className="flex flex-col gap-5 relative">
            <div className="absolute -left-[35px] md:-left-[43px] top-0.5 w-8 h-8 rounded-full bg-[#1B2320] border border-[#232B27] text-white flex items-center justify-center font-bold text-sm z-10 backdrop-blur-md">
              2
            </div>

            <div>
              <h3 className="font-condensed text-2xl font-bold text-white">Court Assignment</h3>
              <p className="text-xs text-[#c3c9b2]">Select your arena configuration & surface</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COURTS_DATA.map((court) => {
                const isSelected = selectedCourt.id === court.id;
                const isBooked = court.isBooked;

                if (isBooked) {
                  return (
                    <div
                      key={court.id}
                      className="bg-[#0c0f0e]/50 border border-dashed border-[#232B27] rounded-xl p-4 flex flex-col justify-between opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-full bg-[#141A16] border border-[#232B27] flex items-center justify-center text-[#5d6562]">
                          <span className="material-symbols-outlined text-[20px]">sports_tennis</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">lock</span> Booked
                        </span>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-condensed text-lg font-bold text-[#c3c9b2]">{court.name}</h4>
                        <div className="flex gap-1.5 text-[11px] text-[#5d6562] mt-1">
                          <span>{court.type}</span> • <span>{court.feature}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`court-btn rounded-xl p-4 flex flex-col justify-between text-left cursor-pointer group ${
                      isSelected ? 'active border-[#bef264]' : 'border-[#232B27]'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#bef264]/10 border-[#bef264] text-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.2)]'
                            : 'bg-[#141A16] border-[#232B27] text-[#c3c9b2] group-hover:border-[#bef264] group-hover:text-[#bef264]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">sports_tennis</span>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                          isSelected
                            ? 'text-[#bef264] bg-[#bef264]/10 border-[#bef264]/30'
                            : 'text-[#c3c9b2] bg-[#141A16] border-[#232B27] group-hover:border-[#bef264]/30'
                        }`}
                      >
                        {selectedTime}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-condensed text-xl font-bold text-white group-hover:text-[#bef264] transition-colors">
                        {court.name}
                      </h4>
                      <div className="flex gap-2 text-xs text-[#c3c9b2] mt-2 flex-wrap">
                        <span className="bg-[#272B29]/70 border border-[#434938]/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">
                            {court.feature === 'Panoramic' ? 'panorama' : 'roofing'}
                          </span>
                          {court.feature}
                        </span>
                        <span className="bg-[#272B29]/70 border border-[#434938]/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">star</span>
                          {court.surface}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Right Sidebar: Booking Summary */}
      <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#232B27] bg-[#0c0f0e]/80 backdrop-blur-2xl flex flex-col z-30 shrink-0 h-auto lg:h-full pb-20 md:pb-0 relative">
        <div className="p-6 lg:p-8 flex flex-col h-full sticky top-0">
          <h3 className="font-condensed text-2xl font-bold mb-5 flex items-center justify-between text-white">
            <span>Summary</span>
            <span className="material-symbols-outlined text-[#bef264] text-[22px] drop-shadow-[0_0_8px_rgba(190,242,100,0.5)]">
              receipt_long
            </span>
          </h3>

          <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex-1 flex flex-col gap-5 relative overflow-hidden shadow-2xl">
            {/* Deco Tennis Ball Texture in corner */}
            <div className="absolute -right-12 -top-12 w-48 h-48 opacity-25 pointer-events-none rounded-full overflow-hidden mix-blend-screen">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6qAS6lP3TgKAA-syEg6TsauoQ7uLKBXxdxofUkqUjP2qSCXmpVY6qj6A4CH2Bj602U7Fw4LBISkyzZNNbMGRuIciZIdV_HyI4br7g7Kkn2C_H_c6bdrZaWnbOHiSwMhGvy0XVokTQmY-mrMXw1DT8FcfeMKEqEcFah-EEdLEkl0goh9SWkBpj393MWLq6D9H1skD-95FLdwzJgdpwMNoTL37fjT3maP7AA6rk7gUcV2-V3ii_nV3-ZpNp_sjmJle3"
                alt="Tennis Ball"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Rows */}
            <div className="flex flex-col gap-4 z-10 relative">
              {/* Date & Time Row */}
              <div className="flex justify-between items-start border-b border-[#232B27] pb-3.5">
                <div>
                  <p className="text-[10px] text-[#bef264] uppercase tracking-widest font-bold mb-0.5">
                    Date
                  </p>
                  <p className="font-condensed text-lg font-bold text-white">{selectedDate.fullDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#bef264] uppercase tracking-widest font-bold mb-0.5">
                    Time
                  </p>
                  <p className="font-condensed text-lg font-bold text-white">
                    {selectedTime} - {calculateEndTime(selectedTime, durationMins)}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <button
                      onClick={() => setDurationMins(60)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        durationMins === 60 ? 'bg-[#bef264] text-[#0B0F0C] font-bold' : 'text-[#c3c9b2] bg-[#1B2320]'
                      }`}
                    >
                      60m
                    </button>
                    <button
                      onClick={() => setDurationMins(90)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        durationMins === 90 ? 'bg-[#bef264] text-[#0B0F0C] font-bold' : 'text-[#c3c9b2] bg-[#1B2320]'
                      }`}
                    >
                      90m
                    </button>
                    <button
                      onClick={() => setDurationMins(120)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        durationMins === 120 ? 'bg-[#bef264] text-[#0B0F0C] font-bold' : 'text-[#c3c9b2] bg-[#1B2320]'
                      }`}
                    >
                      120m
                    </button>
                  </div>
                </div>
              </div>

              {/* Court Selection Row */}
              <div className="flex justify-between items-center border-b border-[#232B27] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B2320] border border-[#232B27] flex items-center justify-center text-[#c3c9b2]">
                    <span className="material-symbols-outlined text-[20px]">stadium</span>
                  </div>
                  <div>
                    <p className="font-condensed text-base font-bold text-white leading-none">
                      {selectedCourt.name}
                    </p>
                    <p className="text-xs text-[#c3c9b2] mt-0.5">
                      {selectedCourt.type} • {selectedCourt.surface}
                    </p>
                  </div>
                </div>
                <span className="font-condensed text-base font-bold text-white">
                  ${baseCourtPrice.toFixed(2)}
                </span>
              </div>

              {/* Add-ons Selector */}
              <div className="py-1">
                <p className="text-[10px] text-[#c3c9b2] uppercase tracking-widest font-bold mb-2">
                  Add-ons & Equipment
                </p>
                <div className="flex flex-col gap-2">
                  {addOns.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleToggleAddOn(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        item.selected
                          ? 'bg-[#bef264]/10 border-[#bef264] text-white shadow-[0_0_10px_rgba(190,242,100,0.15)]'
                          : 'border-dashed border-[#232B27] text-[#c3c9b2] hover:border-[#bef264]/50 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            item.selected ? 'text-[#bef264]' : 'text-[#c3c9b2]'
                          }`}
                        >
                          {item.selected ? 'check_circle' : 'add_circle'}
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-semibold text-white">+${item.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Price and Confirmation Button */}
            <div className="mt-auto z-10 pt-3 border-t border-[#232B27] relative">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs text-[#c3c9b2] font-medium">Total Price</span>
                <span className="font-condensed text-3xl font-bold text-white drop-shadow-sm">
                  ${Math.floor(totalPrice)}
                  <span className="text-lg text-[#c3c9b2]">
                    .{(totalPrice % 1).toFixed(2).substring(2)}
                  </span>
                </span>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-[#bef264] text-[#0B0F0C] font-condensed text-lg font-bold py-3.5 rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_25px_rgba(190,242,100,0.35)] flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Confirm Booking</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
