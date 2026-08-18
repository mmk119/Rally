import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { useApp } from "../../store";
import { askAssistant, fallbackReply, hasApiKey, coachConfirmation } from "../../lib/assistant";
import {
  courts,
  generateHistory,
  getBusiestSlot,
  getClubDigest,
  formatDate,
  formatHour,
  openHour,
  closeHour,
  toDateStr,
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
        <div className="flex justify-between gap-3">
          <span className="text-muted">Court</span>
          <span className="font-semibold text-ink">
            {booking.court}
            <span className="ml-1.5 font-normal text-faint">
              {courts.find((c) => c.id === booking.courtId)?.type}
            </span>
          </span>
        </div>
        <div className="flex justify-between gap-3"><span className="text-muted">When</span><span className="font-semibold text-ink">{formatDate(booking.date)} · {formatHour(booking.hour)}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Players</span><span className="font-semibold text-ink">{booking.players || 4}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Price</span><span className="tabularNums font-semibold text-ink">${booking.price} · 60 min</span></div>
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

/** Shown before anything is removed, so a destructive action always gets a look first. */
function CancelCard({ booking, onConfirm, onKeep, resolved }) {
  return (
    <div
      className={`popIn mt-2 w-full rounded-card border p-4 ${
        resolved ? "border-hairline bg-raised opacity-70" : "border-bad/40 bg-bad/8"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${resolved ? "bg-slate-200 text-faint" : "bg-bad/20 text-bad"}`}>
          {resolved === "cancelled" ? "✓" : "!"}
        </span>
        <p className="text-sm font-bold text-ink">
          {resolved === "cancelled" ? "Booking cancelled" : resolved === "kept" ? "Booking kept" : "Cancel this booking?"}
        </p>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3"><span className="text-muted">Court</span><span className="font-semibold text-ink">{booking.court}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">When</span><span className="font-semibold text-ink">{formatDate(booking.date)} · {formatHour(booking.hour)}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Reference</span><span className="tabularNums font-mono font-bold text-rally-700">{booking.ref}</span></div>
      </div>
      {!resolved && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-bad/90 py-2 text-xs font-bold text-night transition-colors duration-150 hover:bg-bad"
          >
            Yes, cancel it
          </button>
          <button
            onClick={onKeep}
            className="flex-1 rounded-full border border-hairline py-2 text-xs font-bold text-muted transition-colors duration-150 hover:text-ink"
          >
            Keep it
          </button>
        </div>
      )}
    </div>
  );
}

/** Before and after for a moved booking. */
function RescheduleCard({ from, to }) {
  return (
    <div className="popIn mt-2 w-full rounded-card border border-rally-200 bg-rally-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-pop text-xs font-bold text-night">↻</span>
        <p className="text-sm font-bold text-ink">Booking moved</p>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-faint">From</p>
          <p className="text-muted line-through">{from.court} · {formatDate(from.date)} · {formatHour(from.hour)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-faint">To</p>
          <p className="font-semibold text-ink">{to.court} · {formatDate(to.date)} · {formatHour(to.hour)}</p>
        </div>
        <div className="flex justify-between gap-3 pt-1">
          <span className="text-muted">New reference</span>
          <span className="tabularNums font-mono font-bold text-rally-700">{to.ref}</span>
        </div>
      </div>
    </div>
  );
}

/** Several bookings matched, so let the user pick rather than guessing. */
function PickBookingCard({ options, onPick }) {
  return (
    <div className="popIn mt-2 w-full space-y-1.5">
      {options.map((b) => (
        <button
          key={b.ref}
          onClick={() => onPick(b)}
          className="flex w-full items-center justify-between gap-3 rounded-control border border-hairline bg-raised px-3 py-2 text-left text-xs transition-colors duration-150 hover:border-rally-300 hover:bg-rally-50"
        >
          <span className="font-semibold text-ink">{b.court}</span>
          <span className="text-muted">{formatDate(b.date)} · {formatHour(b.hour)}</span>
          <span className="tabularNums font-mono text-faint">{b.ref}</span>
        </button>
      ))}
    </div>
  );
}

function KpiCard({ metric, onViewTab }) {
  const { isSlotTaken } = useApp();
  const stats = useMemo(() => {
    // same predicate as the Analytics tab, so the snippet never disagrees with it
    const history = generateHistory(14, isSlotTaken);
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
  }, [isSlotTaken]);

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
  const {
    setActiveTab,
    addBooking,
    cancelBooking,
    findBookings,
    findAvailableCourt,
    findNearestOpenHour,
    isSlotTaken,
    focusHour,
    activeUserBookings,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [unread, setUnread] = useState(false);
  const insightShown = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  // A pulse on the launcher invites the click that reveals Coach's opening insight.
  useEffect(() => {
    if (open) {
      setUnread(false);
      return;
    }
    if (insightShown.current) return;
    const t = setTimeout(() => setUnread(true), 2500);
    return () => clearTimeout(t);
  }, [open]);

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

  /**
   * Guards against a model returning a slot the club cannot honour. Returns a
   * reason string when the request should become a question instead of an action.
   */
  const slotProblem = (date, hour) => {
    if (!date || !hour) return null;
    if (hour < openHour || hour >= closeHour) {
      return `We only run courts between ${formatHour(openHour)} and ${formatHour(closeHour - 1)}. What time works inside that?`;
    }
    if (date < toDateStr(new Date())) {
      return "That date has already passed. Which upcoming day did you mean?";
    }
    return null;
  };

  /**
   * Finds the booking a cancel or move refers to. Falls back to the user's own
   * most recent booking when the phrasing was loose ("move it to 2pm"), since
   * that is almost always what they mean and both paths still confirm first.
   */
  const resolveTarget = (action) => {
    const criteria = {
      ref: action.ref || undefined,
      date: action.date || undefined,
      hour: action.hour || undefined,
      courtName: action.court,
    };
    const matchesCriteria = (b) =>
      (!criteria.ref || b.ref.toLowerCase() === criteria.ref.toLowerCase()) &&
      (!criteria.date || b.date === criteria.date) &&
      (!criteria.hour || b.hour === criteria.hour) &&
      (!criteria.courtName || criteria.courtName === "any" || b.court === criteria.courtName);

    // "my booking" means theirs, so their own bookings are searched first
    const mine = activeUserBookings.filter(matchesCriteria);
    if (mine.length > 0) return mine;

    const anyMatch = findBookings(criteria);
    if (anyMatch.length > 0) return anyMatch;

    // nothing matched the wording, but they clearly meant something they booked
    if (!action.ref && activeUserBookings.length > 0) return [activeUserBookings[0]];
    return [];
  };

  const runAction = (result) => {
    const { action } = result;
    let card = null;
    let extraText = "";
    let replyOverride = null;

    // ambiguity and validity guards run before anything is created or removed
    if (action?.type === "createBooking" || action?.type === "rescheduleBooking") {
      const problem =
        slotProblem(action.date, action.hour) ||
        (action.type === "rescheduleBooking" ? slotProblem(action.newDate, action.newHour) : null);
      if (problem) return { card: null, extraText: "", replyOverride: problem };
    }

    if (action?.type === "cancelBooking") {
      const matches = resolveTarget(action);
      if (matches.length === 0) {
        return {
          card: null,
          extraText: "",
          replyOverride: "I could not find a live booking matching that. Which reference or day did you mean?",
        };
      }
      if (matches.length > 1) {
        return {
          card: { type: "pick", options: matches.slice(0, 4), intent: "cancel" },
          extraText: "",
          replyOverride: "I found a few that match. Which one should go?",
        };
      }
      return {
        card: { type: "cancel", booking: matches[0] },
        extraText: "",
        replyOverride: "Just to be safe, confirm this is the one.",
      };
    }

    if (action?.type === "rescheduleBooking" && action.newDate && action.newHour) {
      const matches = resolveTarget(action);
      if (matches.length === 0) {
        return {
          card: null,
          extraText: "",
          replyOverride: "I could not find that booking to move. Which reference or day did you mean?",
        };
      }
      const original = matches[0];
      const preferredId = courts.find((c) => c.name === original.court)?.id;
      const court = findAvailableCourt(action.newDate, action.newHour, preferredId);
      if (!court) {
        return {
          card: null,
          extraText: "",
          replyOverride: `${formatHour(action.newHour)} is fully booked that day. Want me to find the nearest open slot?`,
        };
      }
      cancelBooking(original, { withToast: false });
      const moved = addBooking({
        courtId: court.id,
        date: action.newDate,
        hour: action.newHour,
        customer: original.customer,
        source: "chat",
      });
      return {
        card: { type: "reschedule", from: original, to: moved },
        extraText: "",
        replyOverride: "Moved. Same game, new slot.",
      };
    }

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
      if (action.metric === "peak") {
        const slot = getBusiestSlot(30, isSlotTaken);
        if (slot) focusHour(slot.hour);
      }
    }

    return { card, extraText, replyOverride };
  };

  /** Resolves a pending cancel card in place, so the transcript keeps its history. */
  const resolveCancel = (messageIndex, booking, confirmed) => {
    if (confirmed) cancelBooking(booking);
    setMessages((m) =>
      m.map((msg, i) => {
        if (i !== messageIndex) return msg;
        return {
          ...msg,
          card: { ...msg.card, resolved: confirmed ? "cancelled" : "kept" },
          followUp: confirmed
            ? "Done, that slot is free again. You can undo from the toast if that was a slip."
            : "Kept it. Nothing changed.",
        };
      })
    );
  };

  /** User picked one booking out of several matches. */
  const pickBooking = (messageIndex, booking) => {
    setMessages((m) =>
      m.map((msg, i) =>
        i === messageIndex ? { ...msg, card: { type: "cancel", booking } } : msg
      )
    );
  };

  /** The two chips under the proactive insight are answered locally. */
  const handleInsightChip = (text) => {
    const lower = text.toLowerCase();
    if (lower.startsWith("show me the analytics")) {
      const slot = getBusiestSlot(30, isSlotTaken);
      setActiveTab("analytics");
      // point the heatmap at the hour Coach just talked about
      if (slot) focusHour(slot.hour);
      return {
        reply: slot
          ? `Pulled it up. I have highlighted ${slot.hourLabel} on the heatmap, that is where the pressure is.`
          : "Pulled it up on the Analytics tab.",
        action: { type: "none" },
        suggestions: ["Book a court Friday at 3pm", "Show revenue"],
      };
    }
    if (lower.startsWith("yes, suggest a slot")) {
      const slot = getBusiestSlot(30, isSlotTaken);
      if (!slot) return null;
      focusHour(slot.hour);
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
        // a live snapshot of the club travels with every request, so Coach
        // answers long tail analytics questions from real numbers
        result = await askAssistant(history, getClubDigest(isSlotTaken));
      } catch {
        // graceful fallback: keyword matching keeps the demo alive if the API is unavailable
        result = fallbackReply(text);
        setUsedFallback(true);
      }

      // The model sometimes asks which booking is meant even though the app can
      // resolve that itself. When the intent is unmistakable and the user has a
      // live booking, use the parser's action rather than spending a round trip.
      if (result?.action?.type === "none" && /\b(cancel|move|reschedule)\b/i.test(text)) {
        const parsed = fallbackReply(text);
        if (parsed.action.type !== "none" && activeUserBookings.length > 0) {
          result = { ...result, action: parsed.action };
        }
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
        onClick={() => setOpen(true)}
        aria-label="Open Coach"
        aria-expanded={open}
        // the panel carries its own close, so the launcher steps aside while open
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-lime-pop text-night shadow-xl shadow-lime-pop/25 transition duration-150 hover:scale-105 hover:bg-lime-glow active:scale-95 ${
          open ? "hidden" : "flex"
        }`}
      >
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="pulseRing absolute inline-flex h-full w-full rounded-full bg-ok opacity-70" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-night bg-ok" />
          </span>
        )}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" strokeLinejoin="round" />
          <circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="13.5" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/* panel */}
      {open && (
        // full height sheet on phones, floating panel from tablet up
        <div className="panelIn fixed inset-x-0 bottom-0 top-0 z-40 flex flex-col overflow-hidden border border-hairline bg-card shadow-2xl shadow-black/50 sm:inset-x-auto sm:inset-y-auto sm:bottom-24 sm:right-5 sm:top-auto sm:h-[540px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-card">
          <div className="flex items-center gap-3 border-b border-hairline bg-raised px-5 py-4 text-ink">
            <CoachAvatar />
            <div className="flex-1">
              <p className="font-display text-base font-bold uppercase tracking-wide leading-none">Coach</p>
              <p className="mt-1 text-[11px] text-faint">
                {usedFallback ? "Offline mode · pattern matching" : hasApiKey ? "Powered by GPT" : "Demo mode"}
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
            {/* the sheet covers the launcher on phones, so the panel owns its own close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Coach"
              className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors duration-150 hover:bg-card hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => {
              // consecutive bot messages share one avatar and sit closer together
              const groupedWithPrevious = m.role === "bot" && messages[i - 1]?.role === "bot";
              return (
                <div
                  key={i}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} ${
                    groupedWithPrevious ? "mt-1" : "mt-3 first:mt-0"
                  }`}
                >
                  {m.role === "bot" &&
                    (groupedWithPrevious ? (
                      <span className="w-7 shrink-0" aria-hidden="true" />
                    ) : (
                      <CoachAvatar className="h-7 w-7" />
                    ))}
                  <div className={m.role === "user" ? "max-w-[85%]" : "min-w-0 flex-1"}>
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
                    {m.card?.type === "cancel" && (
                      <CancelCard
                        booking={m.card.booking}
                        resolved={m.card.resolved}
                        onConfirm={() => resolveCancel(i, m.card.booking, true)}
                        onKeep={() => resolveCancel(i, m.card.booking, false)}
                      />
                    )}
                    {m.card?.type === "pick" && (
                      <PickBookingCard options={m.card.options} onPick={(b) => pickBooking(i, b)} />
                    )}
                    {m.card?.type === "reschedule" && (
                      <RescheduleCard from={m.card.from} to={m.card.to} />
                    )}
                    {m.followUp && (
                      <div className="slideUp mt-2 rounded-card rounded-bl-sm bg-raised px-4 py-2.5 text-sm leading-relaxed text-ink">
                        {m.followUp}
                      </div>
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
              );
            })}
            {typing && (
              <div className="mt-3 flex justify-start gap-2">
                <CoachAvatar className="h-7 w-7" />
                <div className="flex items-center gap-2 rounded-card rounded-bl-sm bg-raised px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="typingDot" />
                    <span className="typingDot" />
                    <span className="typingDot" />
                  </span>
                  <span className="text-xs text-faint">Coach is thinking</span>
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
