import { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  courts,
  openHour,
  closeHour,
  isSlotPreBooked,
  generateRecentBookings,
  generateDemoBookings,
  newBookingRef,
  toDateStr,
} from "./data/mockData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("analytics");
  const [seedRows] = useState(() => generateRecentBookings());
  const [demoRows] = useState(() => generateDemoBookings());
  const [demoMode, setDemoMode] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [lastBookingRef, setLastBookingRef] = useState(null);

  const isSlotTaken = useCallback(
    (dateStr, hour, courtId) => {
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
    [userBookings, demoMode, demoRows]
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

  const allRows = useMemo(() => {
    const mine = userBookings.map((b) => ({ ...b }));
    return demoMode ? [...mine, ...demoRows, ...seedRows] : [...mine, ...seedRows];
  }, [userBookings, seedRows, demoMode, demoRows]);

  const value = {
    activeTab,
    setActiveTab,
    userBookings,
    allRows,
    addBooking,
    isSlotTaken,
    findAvailableCourt,
    findNearestOpenHour,
    lastBookingRef,
    demoMode,
    setDemoMode,
    todayStr: toDateStr(new Date()),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
