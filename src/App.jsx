import { useApp } from "./store";
// The rim-lit ball on pure black: composited with `screen` so the black pixels
// drop out entirely and only the lit edge reads, like a light source in the room
// rather than a photo pasted onto the page.
import ballGlow from "../pics/2.jpg";
import SideRail, { MobileTopBar, MobileTabBar } from "./components/SideRail";
import AnalyticsTab from "./components/analytics/AnalyticsTab";
import BookingTab from "./components/booking/BookingTab";
import ChatWidget from "./components/chat/ChatWidget";
import UndoToast from "./components/UndoToast";

export default function App() {
  const { activeTab } = useApp();
  return (
    <div className="relative min-h-screen">
      {/* fixed cinematic wash behind everything; purely decorative */}
      <div className="arenaBackdrop" aria-hidden="true" />
      <div
        className="arenaPhoto"
        style={{ backgroundImage: `url(${ballGlow})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen">
        <SideRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          {/* bottom padding clears the mobile tab bar and the chat launcher */}
          <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pb-32 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-8">
            {activeTab === "analytics" ? <AnalyticsTab /> : <BookingTab />}
          </main>
        </div>
      </div>

      <MobileTabBar />
      <ChatWidget />
      <UndoToast />
    </div>
  );
}
