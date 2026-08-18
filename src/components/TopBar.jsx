import { useApp } from "../store";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-pop shadow-sm shadow-lime-pop/20">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#0a0f0b" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.5" fill="#0a0f0b" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block font-display text-xl font-bold uppercase tracking-wide text-ink">Rally</span>
        <span className="block text-[11px] font-medium text-slate-500">Padel court booking</span>
      </div>
    </div>
  );
}

export default function TopBar() {
  const { activeTab, setActiveTab, userBookings } = useApp();
  const tabs = [
    { id: "analytics", label: "Analytics" },
    { id: "booking", label: "Booking", badge: userBookings.length || null },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === t.id
                  ? "bg-card text-rally-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
              {t.badge && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-pop px-1 text-[10px] font-bold text-night">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-lime-pop to-rally-500 text-center text-sm font-bold leading-8 text-night">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
