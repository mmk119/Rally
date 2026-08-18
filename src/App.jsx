import { useApp } from "./store";
import TopBar from "./components/TopBar";
import AnalyticsTab from "./components/analytics/AnalyticsTab";
import BookingTab from "./components/booking/BookingTab";
import ChatWidget from "./components/chat/ChatWidget";

export default function App() {
  const { activeTab } = useApp();
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
        {activeTab === "analytics" ? <AnalyticsTab /> : <BookingTab />}
      </main>
      <ChatWidget />
    </div>
  );
}
