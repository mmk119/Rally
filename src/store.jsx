import { createContext, useContext, useMemo, useState, useCallback, useRef } from "react";
import {
  courts,
  openHour,
  closeHour,
  isSlotPreBooked,
  generateRecentBookings,
  generateDemoBookings,
  newBookingRef,
  toDateStr,
  formatDate,
  formatHour,
} from "./data/mockData";

const AppContext = createContext(null);

const slotKey = (date, hour, courtId) => `${date}|${hour}|${courtId}`;

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("analytics");
  const [seedRows] = useState(() => generateRecentBookings());
  const [demoRows] = useState(() => generateDemoBookings());
  const [demoMode, setDemoMode] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [lastBookingRef, setLastBookingRef] = useState(null);

  // One cancellation record per booking reference. Keeping the slot alongside
  // the ref lets a cancel both mark the row and free the court hour, whether the
  // booking came from the seeded baseline, demo data, or a real user action.
  const [cancellations, setCancellations] = useState(() => new Map());
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // When Coach talks about a specific hour, the heatmap column lights up so the
  // answer and the chart point at the same thing.
  const [heatmapFocus, setHeatmapFocus] = useState(null);
  const focusTimer = useRef(null);
  const focusHour = useCallback((hour) => {
    clearTimeout(focusTimer.current);
    setHeatmapFocus(hour);
    focusTimer.current = setTimeout(() => setHeatmapFocus(null), 6000);
  }, []);

  const cancelledSlots = useMemo(() => {
    const set = new Set();
    for (const c of cancellations.values()) set.add(slotKey(c.date, c.hour, c.courtId));
    return set;
  }, [cancellations]);

  // Single occupancy predicate. Every surface reads this: the slot picker, the
  // heatmap, and (via generateHistory) the KPI cards and charts.
  const isSlotTaken = useCallback(
    (dateStr, hour, courtId) => {
      if (cancelledSlots.has(slotKey(dateStr, hour, courtId))) return false;
      if (isSlotPreBooked(dateStr, hour, courtId)) return true;
      if (
        demoMode &&
        demoRows.some(
          (b) => b.date === dateStr && b.hour === hour && b.courtId === courtId && b.status !== "Cancelled"
        )
      ) {
        return true;
      }
      return userBookings.some(
        (b) => b.date === dateStr && b.hour === hour && b.courtId === courtId && b.status !== "Cancelled"
      );
    },
    [userBookings, demoMode, demoRows, cancelledSlots]
  );

  const findAvailableCourt = useCallback(
    (dateStr, hour, preferredCourtId) => {
      if (preferredCourtId && !isSlotTaken(dateStr, hour, preferredCourtId)) {
        return courts.find((c) => c.id === preferredCourtId);
      }
      return courts.find((c) => !isSlotTaken(dateStr, hour, c.id)) || null;
    },
    [isSlotTaken]
  );

  // If the requested hour is full everywhere, walk outward to the nearest open hour.
  const findNearestOpenHour = useCallback(
    (dateStr, hour) => {
      for (let offset = 0; offset < closeHour - openHour; offset++) {
        for (const h of [hour + offset, hour - offset]) {
          if (h >= openHour && h < closeHour && courts.some((c) => !isSlotTaken(dateStr, h, c.id))) {
            return h;
          }
        }
      }
      return null;
    },
    [isSlotTaken]
  );

  const addBooking = useCallback(({ courtId, date, hour, customer, players, notes, source }) => {
    const court = courts.find((c) => c.id === courtId);
    const booking = {
      ref: newBookingRef(),
      customer: customer || "You",
      court: court.name,
      courtId,
      date,
      hour,
      price: court.price,
      status: "Confirmed",
      players: players || 4,
      notes: notes || "",
      source: source || "app",
      createdAt: Date.now(),
    };
    setUserBookings((prev) => [booking, ...prev]);
    setLastBookingRef(booking.ref);
    return booking;
  }, []);

  const showToast = useCallback((next) => {
    clearTimeout(toastTimer.current);
    setToast(next);
    if (next) toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const restoreBooking = useCallback((ref) => {
    setCancellations((prev) => {
      const next = new Map(prev);
      next.delete(ref);
      return next;
    });
    setLastBookingRef(ref);
  }, []);

  /** Cancels by booking row. Marks the row and frees the court hour. */
  const cancelBooking = useCallback(
    (booking, { withToast = true } = {}) => {
      if (!booking?.ref) return null;
      setCancellations((prev) => {
        const next = new Map(prev);
        next.set(booking.ref, {
          ref: booking.ref,
          date: booking.date,
          hour: booking.hour,
          courtId: booking.courtId,
          cancelledAt: Date.now(),
        });
        return next;
      });
      if (withToast) {
        showToast({
          message: `${booking.court}, ${formatDate(booking.date)} ${formatHour(booking.hour)} cancelled`,
          ref: booking.ref,
          actionLabel: "Undo",
        });
      }
      return booking;
    },
    [showToast]
  );

  const isCancelled = useCallback((ref) => cancellations.has(ref), [cancellations]);

  const allRows = useMemo(() => {
    const base = demoMode
      ? [...userBookings, ...demoRows, ...seedRows]
      : [...userBookings, ...seedRows];
    // a cancelled booking keeps its row, restyled, rather than disappearing
    return base.map((b) =>
      cancellations.has(b.ref) ? { ...b, status: "Cancelled", cancelledByUser: true } : b
    );
  }, [userBookings, seedRows, demoMode, demoRows, cancellations]);

  /** Bookings the user made this session that are still live. */
  const activeUserBookings = useMemo(
    () => userBookings.filter((b) => !cancellations.has(b.ref)),
    [userBookings, cancellations]
  );

  /**
   * Resolves a natural language style cancel request to matching live bookings.
   * Returns every candidate so the assistant can ask which one when ambiguous.
   */
  const findBookings = useCallback(
    ({ ref, date, hour, courtName } = {}) => {
      const live = allRows.filter((b) => b.status !== "Cancelled");
      if (ref) return live.filter((b) => b.ref.toLowerCase() === String(ref).toLowerCase());
      return live.filter(
        (b) =>
          (!date || b.date === date) &&
          (hour === undefined || hour === null || b.hour === hour) &&
          (!courtName || courtName === "any" || b.court === courtName)
      );
    },
    [allRows]
  );

  const value = {
    activeTab,
    setActiveTab,
    userBookings,
    activeUserBookings,
    allRows,
    addBooking,
    cancelBooking,
    restoreBooking,
    isCancelled,
    findBookings,
    isSlotTaken,
    findAvailableCourt,
    findNearestOpenHour,
    lastBookingRef,
    demoMode,
    setDemoMode,
    toast,
    showToast,
    dismissToast,
    heatmapFocus,
    focusHour,
    todayStr: toDateStr(new Date()),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
