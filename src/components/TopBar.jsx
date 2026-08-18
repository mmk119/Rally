import { useApp } from "../store";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-control bg-lime-pop">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#0b0f0c" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.5" fill="#0b0f0c" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block font-display text-xl font-bold uppercase tracking-wide text-ink">Rally</span>
        <span className="hidden text-[11px] font-medium text-faint sm:block">Padel court booking</span>
      </div>
    </div>
  );
}

/** Loads a full day of bookings so a live walkthrough opens on busy analytics. */
function DemoToggle() {
  const { demoMode, setDemoMode } = useApp();
  return (
    <button
      onClick={() => setDemoMode((d) => !d)}
      title="Preload a busy day of bookings for demos"
      aria-pressed={demoMode}
      className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors duration-150 sm:inline-flex ${
        demoMode
          ? "border-rally-300 bg-rally-50 text-rally-700"
          : "border-hairline text-faint hover:text-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
          demoMode ? "bg-lime-pop" : "bg-slate-300"
        }`}
      />
      Demo data
    </button>
  );
}

export default function TopBar() {
  const { activeTab, setActiveTab, userBookings } = useApp();
  const tabs = [
    { id: "analytics", label: "Analytics" },
    { id: "booking", label: "Booking", badge: userBookings.length || null },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <nav className="flex items-center gap-1 rounded-full border border-hairline bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? "page" : undefined}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                activeTab === t.id ? "bg-raised text-ink" : "text-faint hover:text-muted"
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

        <div className="flex items-center gap-3">
          <DemoToggle />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-sm font-bold text-muted">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
