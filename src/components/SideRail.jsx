// Padel crest, supplied as black artwork on white. Inverting it and compositing
// with `screen` drops the white ground entirely, leaving the crest itself.
import crest from "../../pics/3.jpg";
import { useApp } from "../store";

/*
  App shell navigation.

  Desktop gets a persistent left rail, which reads like a real product rather
  than a two-tab demo and leaves the full width to the content. Below md the
  same destinations move to a bottom tab bar, with the brand and demo toggle in
  a slim top bar, so nothing in the rail is lost on a phone.
*/

const navItems = [
  {
    id: "analytics",
    label: "Analytics",
    hint: "Club performance",
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "booking",
    label: "Booking",
    hint: "Reserve a court",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </>
    ),
  },
];

function Icon({ children, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Ball mark: lime ring with the seam, matching the favicon and Coach's avatar. */
export function BallMark({ className = "h-9 w-9" }) {
  return (
    <span className={`relative flex ${className} shrink-0 items-center justify-center`}>
      <span className="absolute inset-0 rounded-full bg-lime-pop/20 blur-md" aria-hidden="true" />
      <svg viewBox="0 0 24 24" className="relative h-full w-full" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" fill="#bef264" />
        <path d="M4.6 6.2c3.4 1.5 5.2 4 5.2 5.8s-1.8 4.3-5.2 5.8" stroke="#0b0f0c" strokeWidth="1.4" fill="none" />
        <path d="M19.4 6.2c-3.4 1.5-5.2 4-5.2 5.8s1.8 4.3 5.2 5.8" stroke="#0b0f0c" strokeWidth="1.4" fill="none" />
      </svg>
    </span>
  );
}

/** The club crest, on the tonal tile the design explorations frame it with. */
function Crest({ className = "h-10 w-10" }) {
  return (
    <span
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-control border border-hairline bg-gradient-to-b from-raised to-pit`}
    >
      <img
        src={crest}
        alt=""
        aria-hidden="true"
        className="h-[78%] w-[78%] object-contain opacity-90 mix-blend-screen invert"
      />
    </span>
  );
}

/**
 * Wordmark. Condensed, italic and tight, the way sports broadcast lockups sit.
 * The rail stacks the crest above the name so the crest has the room its laurel
 * and racket detail needs; the phone header falls back to the simple ball mark,
 * which is what survives at 28px.
 */
export function Wordmark({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <BallMark className="h-7 w-7" />
        <span className="font-display text-2xl font-bold italic uppercase tracking-tight text-ink">
          Rally
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Crest className="h-16 w-16" />
      <span className="mt-2.5 font-display text-3xl font-bold italic uppercase leading-none tracking-tight text-ink">
        Rally
      </span>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-faint">
        Padel Club
      </span>
    </div>
  );
}

/** Loads a full day of bookings so a live walkthrough opens on busy analytics. */
export function DemoToggle({ className = "" }) {
  const { demoMode, setDemoMode } = useApp();
  return (
    <button
      onClick={() => setDemoMode((d) => !d)}
      title="Preload a busy day of bookings for demos"
      aria-pressed={demoMode}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ${
        demoMode
          ? "border-lime-pop/40 bg-lime-pop/10 text-lime-pop"
          : "border-hairline text-faint hover:border-slate-300 hover:text-muted"
      } ${className}`}
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

/** Desktop left rail. */
export default function SideRail() {
  const { activeTab, setActiveTab, activeUserBookings } = useApp();

  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-pit/80 px-3 py-6 backdrop-blur-xl md:flex">
      <div className="px-3">
        <Wordmark />
      </div>

      <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const badge = item.id === "booking" ? activeUserBookings.length : 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-control px-3.5 py-2.5 text-left transition-colors duration-150 ${
                active
                  ? "bg-lime-pop/10 text-lime-pop"
                  : "text-muted hover:bg-raised/60 hover:text-ink"
              }`}
            >
              {active && (
                <span className="railMark absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-lime-pop" aria-hidden="true" />
              )}
              <Icon>{item.icon}</Icon>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold tracking-wide">{item.label}</span>
                <span className={`block text-[11px] ${active ? "text-lime-pop/60" : "text-faint"}`}>
                  {item.hint}
                </span>
              </span>
              {badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-pop px-1.5 text-[10px] font-bold text-night">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 px-1">
        <button
          onClick={() => setActiveTab("booking")}
          className="flex w-full items-center justify-center gap-2 rounded-control bg-lime-pop py-2.5 text-sm font-bold text-night transition duration-150 hover:bg-lime-glow hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] active:scale-[0.98]"
        >
          <Icon className="h-4 w-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeWidth="2.4" />
          </Icon>
          Book a court
        </button>

        <DemoToggle className="justify-center" />

        <div className="flex items-center gap-2.5 border-t border-hairline pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-xs font-bold text-muted">
            M
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-xs font-semibold text-ink">Club manager</span>
            <span className="block text-[10px] text-faint">Rally HQ</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

/** Phone header: brand plus the demo toggle the rail would otherwise carry. */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-night/85 px-4 py-3 backdrop-blur md:hidden">
      <Wordmark compact />
      <DemoToggle />
    </header>
  );
}

/** Phone navigation: the rail's destinations as a bottom bar. */
export function MobileTabBar() {
  const { activeTab, setActiveTab, activeUserBookings } = useApp();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-hairline bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {navItems.map((item) => {
        const active = activeTab === item.id;
        const badge = item.id === "booking" ? activeUserBookings.length : 0;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors duration-150 ${
              active ? "text-lime-pop" : "text-faint"
            }`}
          >
            {active && (
              <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-lime-pop" aria-hidden="true" />
            )}
            <span className="relative">
              <Icon>{item.icon}</Icon>
              {badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-pop px-1 text-[9px] font-bold text-night">
                  {badge}
                </span>
              )}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
