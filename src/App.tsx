import React, { useState } from 'react';
import { ViewMode, Booking } from './types';
import { INITIAL_BOOKINGS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { MobileHeader, MobileNav } from './components/MobileHeader';
import { DashboardView } from './components/DashboardView';
import { CourtsBookingView } from './components/CourtsBookingView';
import { MyBookingsView } from './components/MyBookingsView';
import { RankingsView } from './components/RankingsView';
import { SettingsView } from './components/SettingsView';
import { CoachAIPanel } from './components/CoachAIPanel';
import { BookingSuccessModal } from './components/BookingSuccessModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(true);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('c1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('19:00');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setConfirmedBooking(newBooking);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
  };

  const handleSelectFromAI = (courtId: string, time: string) => {
    setSelectedCourtId(courtId);
    setSelectedTimeSlot(time);
    setCurrentView('courts');
  };

  const handleChallengePlayer = (playerName: string) => {
    setSelectedCourtId('c1');
    setSelectedTimeSlot('19:00');
    setCurrentView('courts');
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#0B0F0C] text-[#e1e3e0] relative select-none">
      {/* Immersive Background Court Overlay */}
      <div className="fixed inset-0 z-[-1] opacity-10 mix-blend-screen pointer-events-none">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUcfOTJl4BPoFNLnkmv8JdBO7Ym2v5zPEsw_kNOw9V6--6VqgVg7FxClfLLFqAL2pjU9jPf7IZ89Bft5dMLQr7AbU1afy_ps0vUfeD-ljQxH4qnfYbrpLicskAilPZJ_LCfGi1KxCMXvh4SH2uwuejPR2C3uRWu7-JoQkUJPScI672nQWNA5dLZKD5gJWzlL1JyyYl_v4dPWmieiS7D_bmP5m2LQwc0ShF-CLuQHa_Ey6M3BMxJw0Btn_jyxGpBS5_"
          alt="Court Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenBooking={() => setCurrentView('courts')}
      />

      {/* Mobile Top Header Bar */}
      <MobileHeader
        onToggleCoach={() => setIsCoachOpen(!isCoachOpen)}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Screen Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden relative pt-16 md:pt-0">
        {currentView === 'dashboard' && (
          <DashboardView
            bookings={bookings}
            onNavigateToCourts={() => setCurrentView('courts')}
            onOpenCoachInsight={(prompt) => {
              setIsCoachOpen(true);
            }}
          />
        )}

        {currentView === 'courts' && (
          <CourtsBookingView
            selectedCourtId={selectedCourtId}
            selectedTimeSlot={selectedTimeSlot}
            onBookingConfirmed={handleBookingConfirmed}
          />
        )}

        {currentView === 'bookings' && (
          <MyBookingsView
            bookings={bookings}
            onNavigateToCourts={() => setCurrentView('courts')}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {currentView === 'rankings' && (
          <RankingsView onChallengePlayer={handleChallengePlayer} />
        )}

        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Floating Interactive Coach AI Panel */}
      <CoachAIPanel
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        onSelectCourtAndTime={handleSelectFromAI}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Booking Success Confirmation Modal with Confetti */}
      {confirmedBooking && (
        <BookingSuccessModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onViewBookings={() => {
            setConfirmedBooking(null);
            setCurrentView('bookings');
          }}
        />
      )}
    </div>
  );
}
