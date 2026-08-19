import { useCallback, useEffect, useMemo, useState } from "react";
// Ball in a dark arena with bokeh: the photographic corner on the summary card,
// the detail the Stitch booking exploration uses to lift it above a plain panel.
import courtLights from "../../../pics/5.png";
import { useApp } from "../../store";
import { courts, openHour, closeHour, toDateStr, formatDate, formatHour } from "../../data/mockData";

const steps = ["Date & time", "Court", "Details", "Confirm"];

/* Day parts split the 14 open hours into three readable blocks instead of one
   long wall of buttons, and give each block an icon you can aim for. */
const dayParts = [
  {
    name: "Morning",
    match: (h) => h < 12,
    icon: <><circle cx="12" cy="13" r="3.4" /><path d="M12 6.5V5M12 21v-1.2M6.7 7.7l-.9-.9M18.2 19.2l-.9-.9M4.5 13H3M21 13h-1.5M6.7 18.3l-.9.9M18.2 6.8l-.9.9" strokeLinecap="round" /></>,
  },
  {
    name: "Afternoon",
    match: (h) => h >= 12 && h < 17,
    icon: <><circle cx="12" cy="12" r="4.2" /><path d="M12 3.5V2M12 22v-1.5M5.2 5.2l-1-1M19.8 19.8l-1-1M3.5 12H2M22 12h-1.5M5.2 18.8l-1 1M19.8 4.2l-1 1" strokeLinecap="round" /></>,
  },
  {
    name: "Evening",
    match: (h) => h >= 17,
    icon: <path d="M20 14.5A8.2 8.2 0 019.6 4a8.5 8.5 0 108.4 14.3 8.3 8.3 0 002-3.8z" strokeLinejoin="round" />,
  },
];

function Glyph({ children, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Racket medallion used on the court cards and in the summary. */
function CourtMark({ active }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
        active ? "border-lime-pop bg-lime-pop/12 text-lime-pop" : "border-hairline bg-raised/60 text-faint"
      }`}
    >
      <Glyph className="h-5 w-5">
        <ellipse cx="12" cy="9" rx="5.5" ry="6.5" />
        <path d="M12 15.5V21M9.6 21h4.8" strokeLinecap="round" />
        <path d="M8 6.5c2.5 1.4 5.5 1.4 8 0M7.4 9.5c3 1.6 6.2 1.6 9.2 0" opacity="0.55" />
      </Glyph>
    </span>
  );
}

function StepBadge({ n, active, done }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
        done
          ? "bg-lime-pop text-night"
          : active
          ? "bg-lime-pop/12 text-lime-pop ring-2 ring-lime-pop"
          : "bg-raised text-faint"
      }`}
    >
      {done ? "✓" : n}
    </span>
  );
}

function Stepper({ current }) {
  return (
    // labels collapse below sm so the stepper never forces horizontal scroll on phones
    <ol className="flex items-center gap-1.5 text-xs font-semibold sm:gap-2">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-1.5 sm:gap-2">
          <StepBadge n={i + 1} active={i === current} done={i < current} />
          <span
            className={`${i === current ? "whitespace-nowrap text-ink" : "hidden text-faint sm:inline"}`}
          >
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px w-3 bg-hairline sm:w-5" />}
        </li>
      ))}
    </ol>
  );
}

/**
 * The finish: a ball drops onto the court, the impact ripples, and the smash
 * throws the ball out of frame to leave the confirmation check behind.
 *
 * Staged rather than one keyframe so the beats are readable, and it settles on
 * the final frame immediately under prefers-reduced-motion — the confirmation
 * has to be legible whether or not it is allowed to move.
 */
function SmashConfirmation() {
  const [stage, setStage] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? 3
      : 0
  );

  useEffect(() => {
    if (stage === 3) return; // reduced motion: already on the final frame
    const timers = [
      setTimeout(() => setStage(1), 420), // ball meets the court
      setTimeout(() => setStage(2), 760), // ripple out, ball away
      setTimeout(() => setStage(3), 1040), // check settles
    ];
    return () => timers.forEach(clearTimeout);
    // one run per mount; a booking always remounts this screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the overshoot the effect depends on; as a class this must be the arbitrary
  // ease-[] form, since a bare cubic-bezier(...) string is not a utility at all
  const overshoot = "ease-[cubic-bezier(0.175,0.885,0.32,1.275)]";

  return (
    <div className="relative mx-auto h-40 w-full overflow-hidden rounded-card border border-lime-pop/20 bg-night/50">
      {/* court markings: service line, centre line, and the side walls */}
      <div className="absolute inset-x-0 bottom-8 h-px bg-ink/25" />
      <div className="absolute bottom-8 left-1/2 top-0 w-px -translate-x-1/2 bg-ink/15" />
      <div className="absolute bottom-8 left-10 top-0 w-px bg-ink/10" />
      <div className="absolute bottom-8 right-10 top-0 w-px bg-ink/10" />

      {/* the ball */}
      <div
        className={`absolute h-7 w-7 rounded-full bg-lime-pop shadow-lg shadow-lime-pop/30 transition-all duration-[420ms] ${
          stage === 0
            ? "-top-10 left-1/4 scale-125 opacity-0"
            : stage === 1
            ? "left-1/2 top-[104px] -translate-x-1/2 scale-90 opacity-100 ease-in"
            : "left-[62%] top-8 scale-100 opacity-0"
        }`}
        aria-hidden="true"
      >
        {/* the seam, so it reads as a ball rather than a dot */}
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
          <path d="M4.6 6.2c3.4 1.5 5.2 4 5.2 5.8s-1.8 4.3-5.2 5.8" stroke="#0b0f0c" strokeWidth="1.6" />
          <path d="M19.4 6.2c-3.4 1.5-5.2 4-5.2 5.8s1.8 4.3 5.2 5.8" stroke="#0b0f0c" strokeWidth="1.6" />
        </svg>
      </div>

      {/* impact ripple on the court surface */}
      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-lime-pop/40 blur-sm transition-all duration-300 ${
          stage === 1 ? "scale-150 opacity-100" : "scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* the confirmation mark the smash leaves behind */}
      <div
        className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lime-pop shadow-lg shadow-lime-pop/30 transition-all duration-500 ${overshoot} ${
          stage >= 2 ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-45 opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-night" fill="none" stroke="currentColor" strokeWidth="3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

function SuccessScreen({ bookings, onDone }) {
  // one court hour per selected day, so a block booking confirms as a set
  const first = bookings[0];
  const multi = bookings.length > 1;
  return (
    <div className="popIn glassCard relative mx-auto max-w-md overflow-hidden rounded-card p-8 text-center shadow-2xl shadow-black/40">
      {/* a wash of accent behind the check, so the finish feels lit rather than flat */}
      <span
        className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-[radial-gradient(closest-side,rgba(190,242,100,0.22),transparent)]"
        aria-hidden="true"
      />
      <SmashConfirmation />
      <h2 className="relative mt-5 font-display text-3xl font-bold uppercase tracking-tight text-ink">
        You're on the court
      </h2>
      <p className="relative mt-1 text-sm text-muted">
        {first.court} · {multi ? `${bookings.length} days` : formatDate(first.date)} at{" "}
        {formatHour(first.hour)}
      </p>
      <div className="relative mt-5 rounded-card border border-lime-pop/25 bg-lime-pop/8 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-pop/80">
          {multi ? `Booking references (${bookings.length})` : "Booking reference"}
        </p>
        {multi ? (
          // each day is its own reservation, so each gets its own reference and
          // can be cancelled on its own later
          <ul className="mt-1 space-y-1">
            {bookings.map((b) => (
              <li key={b.ref} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">{formatDate(b.date)}</span>
                <span className="tabularNums font-mono font-bold text-lime-pop">{b.ref}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tabularNums mt-0.5 font-mono text-xl font-bold text-lime-pop">{first.ref}</p>
        )}
      </div>
      <p className="relative mt-3 text-xs text-faint">
        {multi ? "All " + bookings.length + " were added" : "A confirmation was added"} to Recent
        bookings in Analytics.
      </p>
      <button
        onClick={onDone}
        className="relative mt-6 w-full rounded-control bg-lime-pop py-2.5 text-sm font-bold text-night transition duration-150 hover:bg-lime-glow hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] active:scale-[0.98]"
      >
        Book another court
      </button>
    </div>
  );
}

/**
 * The live summary rail. Every choice lands here as it is made, so the booking
 * is reviewable at every step instead of only on the final screen.
 */
function SummaryRail({ dates, hour, court, name, players, notes, step }) {
  const total = court ? court.price * Math.max(dates.length, 1) : 0;
  const rows = [
    { label: "Players", value: players ? `${players} players` : null },
    { label: "Booked for", value: name.trim() || null },
    { label: "Notes", value: notes.trim() || null },
  ].filter((r) => r.value);

  return (
    <aside className="glassCard sticky top-6 overflow-hidden rounded-card shadow-lg shadow-black/20">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <h3 className="font-display text-base font-bold uppercase tracking-wide text-ink">Summary</h3>
        <Glyph className="h-4 w-4 text-faint">
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" strokeLinejoin="round" />
          <path d="M9.5 8h5M9.5 12h5" strokeLinecap="round" />
        </Glyph>
      </div>

      {/* date + time header, with the photographic corner the design uses for its hero */}
      <div className="relative overflow-hidden px-5 py-4">
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-cover bg-center opacity-45 mix-blend-screen"
          style={{ backgroundImage: `url(${courtLights})` }}
          aria-hidden="true"
        />
        {/* scrim so the DATE and TIME values keep their contrast over the photo */}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-card/85 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-pop/12 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-pop/80">
              {dates.length > 1 ? `Dates · ${dates.length}` : "Date"}
            </p>
            <p className={`mt-1 font-display text-lg font-bold ${dates.length ? "text-ink" : "text-faint"}`}>
              {dates.length ? formatDate(dates[0]) : "Not set"}
            </p>
            {dates.length > 1 && (
              <p className="text-[11px] text-muted">+{dates.length - 1} more day{dates.length > 2 ? "s" : ""}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-pop/80">Time</p>
            <p className={`mt-1 font-display text-lg font-bold ${hour !== null ? "text-ink" : "text-faint"}`}>
              {hour !== null ? formatHour(hour) : "Not set"}
            </p>
            {hour !== null && <p className="text-[11px] text-faint">60 mins</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-hairline px-5 py-4">
        <div className="flex items-center gap-3">
          <CourtMark active={Boolean(court)} />
          <div className="min-w-0 flex-1">
            <p className={`truncate font-semibold ${court ? "text-ink" : "text-faint"}`}>
              {court ? court.name : "No court yet"}
            </p>
            <p className="text-xs text-faint">{court ? court.type : "Chosen in step 2"}</p>
          </div>
          {court && (
            <span className="tabularNums font-display text-lg font-bold text-ink">${court.price}</span>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <dl className="space-y-2 border-t border-hairline px-5 py-4 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-3">
              <dt className="text-faint">{r.label}</dt>
              <dd className="truncate text-right font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-center justify-between border-t border-hairline bg-raised/40 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">
          Total
          {court && dates.length > 1 && (
            <span className="ml-1 font-normal normal-case text-faint">
              (${court.price} × {dates.length})
            </span>
          )}
        </span>
        <span className="tabularNums font-display text-2xl font-bold text-lime-pop">
          {court ? `$${total}` : "—"}
        </span>
      </div>

      {step < 3 && (
        <p className="px-5 pb-4 text-[11px] leading-relaxed text-faint">
          Nothing is charged in this prototype. Bookings are mocked and appear instantly in Analytics.
        </p>
      )}
    </aside>
  );
}

export default function BookingTab() {
  const { isSlotTaken, addBooking, cancelBooking, activeUserBookings } = useApp();
  const [step, setStep] = useState(0);
  // several days can share one booking session: each selected day becomes its
  // own court hour reservation, so a block or weekly booking is one pass
  const [dates, setDates] = useState([]);
  const [hour, setHour] = useState(null);
  const [courtId, setCourtId] = useState(null);
  const [name, setName] = useState("");
  const [players, setPlayers] = useState(4);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");

  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push({
        str: toDateStr(d),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
        day: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: i === 0,
      });
    }
    return out;
  }, []);

  const hours = useMemo(() => {
    const out = [];
    for (let h = openHour; h < closeHour; h++) out.push(h);
    return out;
  }, []);

  /** Free on every selected day: what a court hour has to be to be bookable. */
  const freeOnAllDates = useCallback(
    (hourValue, courtId) => dates.length > 0 && dates.every((d) => !isSlotTaken(d, hourValue, courtId)),
    [dates, isSlotTaken]
  );

  /** How many courts are open at this hour across every selected day. */
  const courtsFreeAt = useCallback(
    (hourValue) => courts.filter((c) => freeOnAllDates(hourValue, c.id)).length,
    [freeOnAllDates]
  );

  /**
   * Adding or removing a day can invalidate a time or court chosen earlier, so
   * both are re-checked against the new set rather than left silently wrong.
   */
  const toggleDate = (dayStr) => {
    setDates((prev) => {
      const next = prev.includes(dayStr)
        ? prev.filter((d) => d !== dayStr) // clicking a chosen day clears it
        : [...prev, dayStr].sort();

      if (hour !== null) {
        const stillOpen =
          next.length > 0 && next.every((d) => courts.some((c) => !isSlotTaken(d, hour, c.id)));
        if (!stillOpen) {
          setHour(null);
          setCourtId(null);
        } else if (courtId !== null && next.some((d) => isSlotTaken(d, hour, courtId))) {
          setCourtId(null);
        }
      }
      return next;
    });
  };

  const reset = () => {
    setStep(0);
    setDates([]);
    setHour(null);
    setCourtId(null);
    setName("");
    setPlayers(4);
    setNotes("");
    setConfirmed(null);
    setError("");
  };

  const confirm = () => {
    if (!name.trim()) {
      // send the user back to Details, where the field level error is visible
      setError("Please add a name for the booking.");
      setStep(2);
      return;
    }
    // one reservation per day, so each can be cancelled independently later
    const created = dates.map((d) =>
      addBooking({ courtId, date: d, hour, customer: name.trim(), players, notes, source: "form" })
    );
    setConfirmed(created);
  };

  if (confirmed) return <SuccessScreen bookings={confirmed} onDone={reset} />;

  const selectedCourt = courts.find((c) => c.id === courtId);

  return (
    <div className="space-y-5">
      <div className="riseIn flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-pop">
            Step {step + 1} of {steps.length}
          </div>
          <h1 className="mt-1.5 font-display text-4xl font-bold uppercase leading-none tracking-tight text-ink sm:text-5xl">
            Reserve a court
          </h1>
          <p className="mt-2 text-sm text-muted">
            Pick a slot, choose your court, and you're in. Peak hours fill first.
          </p>
        </div>
        <Stepper current={step} />
      </div>

      {/* main column plus the persistent summary rail, the composition from the
          Stitch booking exploration */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* min-w-0: grid items default to min-width:auto, which would let the
            day strip's intrinsic width push the column past the viewport */}
        <div className="glassCard riseIn min-w-0 rounded-card p-5 shadow-lg shadow-black/20 sm:p-6" style={{ "--d": "60ms" }}>
          {step === 0 && (
            <div className="slideUp space-y-7">
              <section>
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <StepBadge n={1} active />
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                    Choose a day
                  </h3>
                  {/* multi select is not discoverable on its own, so say it */}
                  <span className="text-xs text-faint">
                    {dates.length > 1
                      ? `${dates.length} days selected · same court and time on each`
                      : "Pick one, or several for a block booking"}
                  </span>
                  {dates.length > 0 && (
                    <button
                      onClick={() => {
                        setDates([]);
                        setHour(null);
                        setCourtId(null);
                      }}
                      className="ml-auto rounded-full px-2.5 py-1 text-xs font-semibold text-faint transition-colors duration-150 hover:bg-raised hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {/* the strip scrolls; the mask fades the last chip out so the
                    cut edge reads as "more days" rather than a clipped card */}
                <div className="dayStrip flex gap-2 overflow-x-auto pb-2">
                  {days.map((d) => {
                    const active = dates.includes(d.str);
                    return (
                      <button
                        key={d.str}
                        onClick={() => toggleDate(d.str)}
                        aria-pressed={active}
                        className={`slotBase flex min-w-16 flex-col items-center rounded-control border px-3 py-2.5 ${
                          active
                            ? "limeGlow border-lime-pop bg-lime-pop text-night"
                            : "slotOpen border-hairline bg-raised/50 text-slate-600"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                          {d.isToday ? "Today" : d.weekday}
                        </span>
                        <span className="font-display text-xl font-bold leading-tight">{d.day}</span>
                        <span className="text-[10px] font-medium uppercase opacity-70">{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <StepBadge n={2} active={dates.length > 0} />
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                      Choose a start time
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-faint">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-lime-pop" /> Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-hairline bg-raised" /> Open
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-400" /> Full
                    </span>
                  </div>
                </div>

                {dates.length === 0 ? (
                  <div className="rounded-control border border-dashed border-hairline bg-night/40 px-4 py-10 text-center">
                    <Glyph className="mx-auto h-7 w-7 text-faint">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
                    </Glyph>
                    <p className="mt-2 text-sm font-semibold text-slate-700">Pick a day to see open slots</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Fourteen days of court time, ready when you are.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {dayParts.map((part) => {
                      const partHours = hours.filter((h) => part.match(h));
                      if (partHours.length === 0) return null;
                      return (
                        <div key={part.name}>
                          <div className="mb-2.5 flex items-center gap-2">
                            <Glyph className="h-4 w-4 text-lime-pop/70">{part.icon}</Glyph>
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                              {part.name}
                            </span>
                            <span className="h-px flex-1 bg-hairline" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                            {partHours.map((h) => {
                              const left = courtsFreeAt(h);
                              const full = left === 0;
                              const active = hour === h;
                              return (
                                <button
                                  key={h}
                                  disabled={full}
                                  onClick={() => setHour(h)}
                                  aria-pressed={active}
                                  className={`slotBase relative rounded-control border px-2 py-2.5 text-sm font-semibold ${
                                    full
                                      ? "slotFull border-hairline bg-night/50 text-faint"
                                      : active
                                      ? "limeGlow border-lime-pop bg-lime-pop text-night"
                                      : "slotOpen border-hairline bg-raised/60 text-slate-700"
                                  }`}
                                >
                                  {active && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-night text-[9px] font-bold text-lime-pop ring-2 ring-lime-pop">
                                      ✓
                                    </span>
                                  )}
                                  {formatHour(h)}
                                  {!full && left <= 2 && (
                                    <span
                                      className={`mt-0.5 block text-[10px] font-bold ${
                                        active ? "text-night/70" : "text-warn"
                                      }`}
                                    >
                                      {left} court{left > 1 ? "s" : ""} left
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="flex justify-end border-t border-hairline pt-5">
                <button
                  disabled={dates.length === 0 || hour === null}
                  onClick={() => setStep(1)}
                  className="rounded-control bg-lime-pop px-7 py-2.5 text-sm font-bold text-night transition duration-150 enabled:hover:bg-lime-glow enabled:hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="slideUp space-y-6">
              <div className="flex items-center gap-2.5">
                <StepBadge n={2} active />
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                    Court assignment
                  </h3>
                  <p className="text-xs text-faint">
                    {dates.length > 1
                      ? `${dates.length} days at ${formatHour(hour)} · must be free on all of them`
                      : `${formatDate(dates[0])} at ${formatHour(hour)}`}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {courts.map((c) => {
                  const taken = !freeOnAllDates(hour, c.id);
                  const active = courtId === c.id;
                  return (
                    <button
                      key={c.id}
                      disabled={taken}
                      onClick={() => setCourtId(c.id)}
                      aria-pressed={active}
                      className={`slotBase flex flex-col gap-3 rounded-card border p-4 text-left ${
                        taken
                          ? "slotFull border-hairline bg-night/40 opacity-60"
                          : active
                          ? "border-lime-pop bg-lime-pop/6 shadow-[0_8px_24px_rgba(190,242,100,0.12)]"
                          : "slotOpen border-hairline bg-raised/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <CourtMark active={active} />
                        {taken ? (
                          <span className="flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-faint">
                            <Glyph className="h-3 w-3">
                              <rect x="5" y="10" width="14" height="10" rx="2" />
                              <path d="M8 10V7a4 4 0 018 0v3" />
                            </Glyph>
                            Booked
                          </span>
                        ) : (
                          <span className="tabularNums font-display text-xl font-bold text-ink">
                            ${c.price}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                          {c.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {[c.type, "Glass walls", "LED lighting"].map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                active
                                  ? "border-lime-pop/40 text-lime-pop"
                                  : "border-hairline text-faint"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          taken ? "text-faint" : active ? "text-lime-pop" : "text-ok"
                        }`}
                      >
                        {taken ? "Full" : active ? "Selected" : "Available"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between border-t border-hairline pt-5">
                <button
                  onClick={() => setStep(0)}
                  className="rounded-control px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
                >
                  Back
                </button>
                <button
                  disabled={!courtId}
                  onClick={() => setStep(2)}
                  className="rounded-control bg-lime-pop px-7 py-2.5 text-sm font-bold text-night transition duration-150 enabled:hover:bg-lime-glow enabled:hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="slideUp space-y-5">
              <div className="flex items-center gap-2.5">
                <StepBadge n={3} active />
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                  A couple of details
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Name on the booking
                  </span>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. Maya Haddad"
                    className={`w-full rounded-control border bg-night/60 px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-lime-pop ${
                      error ? "border-bad bg-bad/10" : "border-hairline"
                    }`}
                  />
                  {error && <span className="mt-1 block text-xs font-medium text-bad">{error}</span>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Players
                  </span>
                  <div className="flex gap-2">
                    {[2, 4].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlayers(p)}
                        aria-pressed={players === p}
                        className={`slotBase flex-1 rounded-control border py-2.5 text-sm font-semibold ${
                          players === p
                            ? "border-lime-pop bg-lime-pop/10 text-lime-pop"
                            : "slotOpen border-hairline bg-raised/50 text-muted"
                        }`}
                      >
                        {p} players
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Notes (optional)
                </span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Need rental rackets, beginner friendly…"
                  className="w-full rounded-control border border-hairline bg-night/60 px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-lime-pop"
                />
              </label>

              <div className="flex justify-between border-t border-hairline pt-5">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-control px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!name.trim()) {
                      setError("Please add a name for the booking.");
                      return;
                    }
                    setStep(3);
                  }}
                  className="rounded-control bg-lime-pop px-7 py-2.5 text-sm font-bold text-night transition duration-150 hover:bg-lime-glow hover:shadow-[0_0_20px_rgba(190,242,100,0.35)] active:scale-[0.98]"
                >
                  Review booking
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="slideUp space-y-5">
              <div className="flex items-center gap-2.5">
                <StepBadge n={4} active />
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                  Confirm your booking
                </h3>
              </div>

              <div className="space-y-3 rounded-card border border-hairline bg-night/40 p-5 text-sm">
                {[
                  ["Court", `${selectedCourt.name} · ${selectedCourt.type}`],
                  ["Time", `${formatHour(hour)} · 60 min`],
                  ["Booked for", `${name || "—"} · ${players} players`],
                  [
                    "Price",
                    dates.length > 1
                      ? `$${selectedCourt.price * dates.length} · $${selectedCourt.price} × ${dates.length} days`
                      : `$${selectedCourt.price} for 60 min`,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-faint">{k}</span>
                    <span className="text-right font-semibold text-ink">{v}</span>
                  </div>
                ))}
                {/* every day being booked, listed so nothing is confirmed unseen */}
                <div className="flex justify-between gap-4">
                  <span className="text-faint">{dates.length > 1 ? `Days (${dates.length})` : "Day"}</span>
                  <span className="text-right font-semibold text-ink">
                    {dates.map((d) => (
                      <span key={d} className="block">
                        {formatDate(d)}
                      </span>
                    ))}
                  </span>
                </div>
                {notes && (
                  <div className="flex justify-between gap-4">
                    <span className="text-faint">Notes</span>
                    <span className="text-right font-medium text-slate-600">{notes}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-hairline pt-5">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-control px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
                >
                  Back
                </button>
                <button
                  onClick={confirm}
                  className="limeGlow rounded-control bg-lime-pop px-8 py-2.5 text-sm font-bold text-night transition duration-150 hover:bg-lime-glow active:scale-[0.98]"
                >
                  Confirm booking
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="riseIn min-w-0" style={{ "--d": "120ms" }}>
          <SummaryRail
            dates={dates}
            hour={hour}
            court={selectedCourt}
            name={name}
            players={players}
            notes={notes}
            step={step}
          />
        </div>
      </div>

      {activeUserBookings.length > 0 && (
        <div className="glassCard rounded-card p-5 shadow-lg shadow-black/20">
          <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-ink">
            Your upcoming bookings
          </h3>
          <div className="space-y-2">
            {activeUserBookings.map((b) => (
              <div
                key={b.ref}
                className="group flex flex-wrap items-center justify-between gap-2 rounded-control border border-hairline bg-raised/40 px-4 py-3 text-sm transition-colors duration-150 hover:border-rally-300"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tabularNums rounded-md border border-hairline bg-night/60 px-2 py-1 font-mono text-[11px] font-bold text-lime-pop">
                    {b.ref}
                  </span>
                  <span className="font-semibold text-ink">{b.court}</span>
                  <span className="text-muted">
                    {formatDate(b.date)} · {formatHour(b.hour)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {b.source === "chat" && (
                    <span className="rounded-full border border-lime-pop/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime-pop">
                      via chat
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wide text-ok">Confirmed</span>
                  <button
                    onClick={() => cancelBooking(b)}
                    aria-label={`Cancel booking ${b.ref}`}
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-faint transition duration-150 hover:bg-bad/12 hover:text-bad sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
