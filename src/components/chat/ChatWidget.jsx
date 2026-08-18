import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { useApp } from "../../store";
import { askAssistant, fallbackReply, hasApiKey, coachConfirmation } from "../../lib/assistant";
import {
  courts,
  generateHistory,
  getBusiestSlot,
  formatDate,
  formatHour,
  openHour,
  closeHour,
} from "../../data/mockData";

/** Coach's mark: a ball with a lime ring, matching the product logo. */
function CoachAvatar({ className = "h-9 w-9" }) {
  return (
    <div className={`flex ${className} shrink-0 items-center justify-center rounded-full bg-lime-pop/12`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="#bef264" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="#bef264" />
      </svg>
    </div>
  );
}

/* ---------- rich reply cards ---------- */

function BookingCard({ booking, onViewTab }) {
  return (
    <div className="popIn mt-2 w-full rounded-card border border-rally-200 bg-rally-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-pop text-xs font-bold text-night">
          ✓
        </span>
        <p className="text-sm font-bold text-ink">Booking confirmed</p>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3"><span className="text-muted">Court</span><span className="font-semibold text-ink">{booking.court}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">When</span><span className="font-semibold text-ink">{formatDate(booking.date)} · {formatHour(booking.hour)}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Price</span><span className="tabularNums font-semibold text-ink">${booking.price}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Reference</span><span className="tabularNums font-mono font-bold text-rally-700">{booking.ref}</span></div>
      </div>
      <button
        onClick={onViewTab}
        className="mt-3 w-full rounded-full bg-lime-pop py-2 text-xs font-bold text-night transition-colors duration-150 hover:bg-lime-glow active:scale-[0.99]"
      >
        View in Booking tab
      </button>
    </div>
  );
}

function KpiCard({ metric, onViewTab }) {
  const stats = useMemo(() => {
    const history = generateHistory(14);
    const week = history.slice(-7);
    const prev = history.slice(0, 7);
    const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
    const bookings = sum(week, "bookings");
    const prevBookings = sum(prev, "bookings") || 1;
    const revenue = sum(week, "revenue");
    const prevRevenue = sum(prev, "revenue") || 1;
    const occupancy = (bookings / (7 * courts.length * (closeHour - openHour))) * 100;
    return {
      spark: week.map((d) => ({ v: d.bookings })),
      bookings,
      bookingsDelta: ((bookings - prevBookings) / prevBookings) * 100,
      revenue,
      revenueDelta: ((revenue - prevRevenue) / prevRevenue) * 100,
      occupancy,
    };
  }, []);

  const rows = {
    bookings: { label: "Bookings this week", value: stats.bookings.toLocaleString(), delta: stats.bookingsDelta },
    revenue: { label: "Revenue this week", value: `$${stats.revenue.toLocaleString()}`, delta: stats.revenueDelta },
    occupancy: { label: "Occupancy this week", value: `${stats.occupancy.toFixed(0)}%`, delta: stats.bookingsDelta },
    peak: { label: "Peak hour", value: "7:00 PM", delta: null },
  };
  const main = rows[metric] || rows.bookings;

  return (
    <div className="popIn mt-2 w-full rounded-card border border-hairline bg-raised p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-faint">{main.label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="tabularNums font-display text-2xl font-bold leading-none text-ink">{main.value}</span>
        {main.delta !== null && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${main.delta >= 0 ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad"}`}>
            {main.delta >= 0 ? "▲" : "▼"} {Math.abs(main.delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bef264" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#bef264" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#bef264" strokeWidth={2} fill="url(#sparkFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-faint">Last 7 days · vs the week before</p>
      <button
        onClick={onViewTab}
        className="mt-2 w-full rounded-full border border-hairline py-1.5 text-xs font-bold text-rally-700 transition-colors duration-150 hover:border-rally-300 hover:bg-rally-50"
      >
        Open full analytics
      </button>
    </div>
  );
}

/* ---------- chat plumbing ---------- */

const welcome = {
  role: "bot",
  text: "Hey, Coach here. I can get you on court, or read you the club numbers.",
  suggestions: ["Book a court Friday at 3pm", "How are bookings this week?", "Show revenue"],
};

export default function ChatWidget() {
  const { setActiveTab, addBooking, findAvailableCourt, findNearestOpenHour, isSlotTaken } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const insightShown = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  // On the first open of the session, Coach volunteers one real insight read
  // off the booking data rather than a canned line.
  useEffect(() => {
    // ref guard, so marking it shown does not re-run this effect and cancel the timer
    if (!open || insightShown.current) return;
    insightShown.current = true;
    const slot = getBusiestSlot(30, isSlotTaken);
    if (!slot) return;
    const t = setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `Heads up, ${slot.weekdayName}s at ${slot.hourLabel} are your busiest slot right now, running ${slot.occupancyPct}% full. Want me to suggest opening an extra court then?`,
          suggestions: ["Yes, suggest a slot", "Show me the analytics"],
        },
      ]);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const runAction = (result) => {
    const { action } = result;
    let card = null;
    let extraText = "";
    let replyOverride = null;

    if (action?.type === "createBooking" && action.date && action.hour) {
      const preferredId = action.court !== "any" ? courts.find((c) => c.name === action.court)?.id : null;
      let hour = action.hour;
      let court = findAvailableCourt(action.date, hour, preferredId);
      if (!court) {
        const nearest = findNearestOpenHour(action.date, hour);
        if (nearest !== null) {
          extraText = ` ${formatHour(hour)} was fully booked, so I grabbed the nearest open slot at ${formatHour(nearest)}.`;
          hour = nearest;
          court = findAvailableCourt(action.date, hour, preferredId);
        }
      }
      if (court) {
        const booking = addBooking({ courtId: court.id, date: action.date, hour, customer: "You", source: "chat" });
        card = { type: "booking", booking };
        // Coach voices the confirmation using the slot that actually resolved
        replyOverride = coachConfirmation(
          court.name,
          formatDate(booking.date).replace(/^\w+, /, ""),
          formatHour(booking.hour)
        );
      } else {
        extraText = " That whole day is fully booked, try another day?";
      }
    }

    if (action?.type === "showAnalytics") {
      card = { type: "kpi", metric: action.metric === "none" ? "bookings" : action.metric };
    }

    return { card, extraText, replyOverride };
  };

  /** The two chips under the proactive insight are answered locally. */
  const handleInsightChip = (text) => {
    const lower = text.toLowerCase();
    if (lower.startsWith("show me the analytics")) {
      setActiveTab("analytics");
      return {
        reply: "Pulled it up on the Analytics tab, the heatmap shows where the pressure is.",
        action: { type: "none" },
        suggestions: ["Book a court Friday at 3pm", "Show revenue"],
      };
    }
    if (lower.startsWith("yes, suggest a slot")) {
      const slot = getBusiestSlot(30, isSlotTaken);
      if (!slot) return null;
      return {
        reply: `${slot.weekdayName} ${slot.hourLabel} is the one to add capacity to, it runs ${slot.occupancyPct}% full. Freeing a court there is your easiest win.`,
        action: { type: "none" },
        suggestions: [`Book a court ${slot.weekdayName} at ${slot.hourLabel}`, "Show me the analytics"],
      };
    }
    return null;
  };

  const send = async (rawText) => {
    const text = (rawText ?? input).trim();
    if (!text || typing) return;
    setInput("");
    const history = [...messages.map(({ role, text }) => ({ role, text })), { role: "user", text }];
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);

    let result = handleInsightChip(text);
    if (!result) {
      try {
        if (!hasApiKey) throw new Error("noApiKey");
        result = await askAssistant(history);
      } catch {
        // graceful fallback: keyword matching keeps the demo alive if the API is unavailable
        result = fallbackReply(text);
        setUsedFallback(true);
      }
    }

    const { card, extraText, replyOverride } = runAction(result);
    setTyping(false);
    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text: (replyOverride || result.reply || "Done.") + extraText,
        card,
        suggestions: (result.suggestions || []).slice(0, 3),
      },
    ]);
  };

  return (
    <>
      {/* floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Coach" : "Open Coach"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-lime-pop text-night shadow-xl shadow-lime-pop/25 transition duration-150 hover:scale-105 hover:bg-lime-glow active:scale-95"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" strokeLinejoin="round" />
            <circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="13.5" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        )}
      </button>

      {/* panel */}
      {open && (
        <div className="slideUp fixed bottom-24 right-5 z-40 flex h-[540px] max-h-[calc(100vh-8rem)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-hairline bg-card shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 border-b border-hairline bg-raised px-5 py-4 text-ink">
            <CoachAvatar />
            <div className="flex-1">
              <p className="font-display text-base font-bold uppercase tracking-wide leading-none">Coach</p>
              <p className="mt-1 text-[11px] text-faint">
                {usedFallback ? "Offline mode · pattern matching" : hasApiKey ? "Powered by GPT" : "Demo mode"}
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-lime-pop" />
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
                  <div
                    className={`slideUp rounded-card px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-lime-pop font-medium text-night"
                        : "rounded-bl-sm bg-raised text-ink"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.card?.type === "booking" && (
                    <BookingCard booking={m.card.booking} onViewTab={() => setActiveTab("booking")} />
                  )}
                  {m.card?.type === "kpi" && (
                    <KpiCard metric={m.card.metric} onViewTab={() => setActiveTab("analytics")} />
                  )}
                  {m.role === "bot" && i === messages.length - 1 && !typing && m.suggestions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-hairline bg-card px-3 py-1 text-xs font-semibold text-rally-700 transition-colors duration-150 hover:border-rally-300 hover:bg-rally-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-card rounded-bl-sm bg-raised px-4 py-3">
                  <span className="typingDot" />
                  <span className="typingDot" />
                  <span className="typingDot" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-hairline px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: book a court Friday at 3pm"
              aria-label="Message Coach"
              className="flex-1 rounded-full border border-hairline bg-raised px-4 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition-colors duration-150 focus:border-rally-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-pop text-night transition duration-150 enabled:hover:bg-lime-glow enabled:active:scale-95 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 translate-x-px" fill="currentColor">
                <path d="M3.4 20.4l17.4-7.5a1 1 0 000-1.8L3.4 3.6a1 1 0 00-1.4 1.1L3.5 11 13 12 3.5 13l-1.5 6.3a1 1 0 001.4 1.1z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
