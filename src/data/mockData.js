// All data in Rally is mocked and deterministic so the demo behaves the same every run.

export const courts = [
  { id: 1, name: "Court 1", type: "Indoor", price: 40 },
  { id: 2, name: "Court 2", type: "Indoor", price: 40 },
  { id: 3, name: "Court 3", type: "Outdoor", price: 32 },
  { id: 4, name: "Court 4", type: "Panoramic", price: 48 },
];

export const openHour = 8;
export const closeHour = 22; // last slot starts at 21:00

// simple deterministic hash so availability is stable across renders
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// A slot is "full" (pre booked by mock customers) based on the hash.
// Evenings and weekends are busier, mornings quieter.
export function isSlotPreBooked(dateStr, hour, courtId) {
  const d = new Date(dateStr + "T00:00:00");
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const evening = hour >= 17;
  let threshold = 30; // base % chance a slot is taken
  if (evening) threshold += 42;
  if (weekend) threshold += 16;
  return hash(`${dateStr}|${hour}|${courtId}`) % 100 < threshold;
}

export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatHour(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
}

const firstNames = ["Maya", "Omar", "Lina", "Karim", "Sara", "Ziad", "Nour", "Rami", "Dana", "Tarek", "Layla", "Hadi", "Yara", "Fadi", "Mira", "Sami"];
const lastNames = ["Haddad", "Khoury", "Nassar", "Saad", "Aoun", "Farah", "Sleiman", "Matar", "Chami", "Ghanem"];

function refFrom(n) {
  return `RLY${String(3200 + n)}`;
}

/**
 * Daily totals for the last N days, used by KPI cards and the trend chart.
 *
 * Takes the same occupancy predicate the heatmap and slot picker use, so every
 * surface reads one source of truth: a booking made in chat raises the KPIs,
 * and a cancellation lowers them. Falls back to the seeded baseline when no
 * predicate is supplied.
 */
export function generateHistory(days, isSlotTaken) {
  const taken = isSlotTaken || isSlotPreBooked;
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = toDateStr(d);
    let bookings = 0;
    let revenue = 0;
    const perCourt = {};
    for (const c of courts) {
      let count = 0;
      for (let h = openHour; h < closeHour; h++) {
        if (taken(ds, h, c.id)) count++;
      }
      perCourt[c.name] = count;
      bookings += count;
      revenue += count * c.price;
    }
    out.push({ date: ds, label: formatDate(ds).replace(/^\w+, /, ""), bookings, revenue, perCourt });
  }
  return out;
}

// Recent bookings shown in the analytics table.
export function generateRecentBookings() {
  const rows = [];
  const today = new Date();
  const statuses = ["Confirmed", "Confirmed", "Confirmed", "Confirmed", "Pending", "Cancelled"];
  for (let i = 0; i < 26; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (hash(`row${i}`) % 9));
    const ds = toDateStr(d);
    const court = courts[hash(`court${i}`) % courts.length];
    const hour = openHour + (hash(`hour${i}`) % (closeHour - openHour));
    rows.push({
      ref: refFrom(i * 7 + (hash(`ref${i}`) % 6)),
      customer: `${firstNames[hash(`fn${i}`) % firstNames.length]} ${lastNames[hash(`ln${i}`) % lastNames.length]}`,
      court: court.name,
      courtId: court.id, // needed so any row can be cancelled and free its slot
      date: ds,
      hour,
      price: court.price,
      status: statuses[hash(`st${i}`) % statuses.length],
      createdAt: today.getTime() - i * 3600_000,
    });
  }
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export function newBookingRef() {
  return `RLY${Math.floor(4000 + Math.random() * 5000)}`;
}

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Occupancy per court per hour across a window of days, as a 0..1 ratio.
 * Rows are courts, columns are hours, which is exactly what the heatmap draws.
 */
export function getHeatmap(days, isSlotTaken) {
  const history = generateHistory(days);
  const taken = isSlotTaken || ((d, h, c) => isSlotPreBooked(d, h, c));
  const hours = [];
  for (let h = openHour; h < closeHour; h++) hours.push(h);

  const rows = courts.map((court) => ({
    court: court.name,
    cells: hours.map((hour) => {
      let count = 0;
      for (const day of history) if (taken(day.date, hour, court.id)) count++;
      return { hour, ratio: history.length ? count / history.length : 0, count };
    }),
  }));

  return { hours, rows, days: history.length };
}

/**
 * The single busiest weekday-and-hour pairing over the given window.
 * Used by the assistant to open with a real insight rather than a canned line.
 */
export function getBusiestSlot(days = 30, isSlotTaken) {
  const history = generateHistory(days);
  const taken = isSlotTaken || ((d, h, c) => isSlotPreBooked(d, h, c));
  const buckets = new Map(); // "weekday|hour" -> { count, samples }

  for (const day of history) {
    const weekday = new Date(day.date + "T00:00:00").getDay();
    for (let hour = openHour; hour < closeHour; hour++) {
      const key = `${weekday}|${hour}`;
      const entry = buckets.get(key) || { count: 0, samples: 0 };
      for (const c of courts) {
        entry.samples++;
        if (taken(day.date, hour, c.id)) entry.count++;
      }
      buckets.set(key, entry);
    }
  }

  let best = null;
  for (const [key, entry] of buckets) {
    const [weekday, hour] = key.split("|").map(Number);
    const rate = entry.samples ? entry.count / entry.samples : 0;
    if (!best || rate > best.rate) {
      best = { weekday, hour, rate, count: entry.count };
    }
  }
  if (!best) return null;

  return {
    weekday: best.weekday,
    weekdayName: weekdayNames[best.weekday],
    hour: best.hour,
    hourLabel: formatHour(best.hour),
    occupancyPct: Math.round(best.rate * 100),
  };
}

/**
 * A compact, truthful snapshot of the club, injected into the assistant's
 * system prompt so it can answer long tail questions ("which court is
 * underused?", "when are we quietest?") from real numbers instead of guessing.
 */
export function getClubDigest(isSlotTaken) {
  const taken = isSlotTaken || isSlotPreBooked;
  const history = generateHistory(14, taken);
  const week = history.slice(-7);
  const prev = history.slice(0, 7);
  const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);

  const bookings = sum(week, "bookings");
  const prevBookings = sum(prev, "bookings") || 1;
  const revenue = sum(week, "revenue");
  const slots = 7 * courts.length * (closeHour - openHour);

  const perCourt = {};
  for (const day of week) {
    for (const [name, count] of Object.entries(day.perCourt)) {
      perCourt[name] = (perCourt[name] || 0) + count;
    }
  }
  const ranked = Object.entries(perCourt).sort((a, b) => b[1] - a[1]);

  // occupancy by hour across the week, for busiest and quietest
  const byHour = [];
  for (let h = openHour; h < closeHour; h++) {
    let count = 0;
    for (const day of week) for (const c of courts) if (taken(day.date, h, c.id)) count++;
    byHour.push({ hour: h, rate: count / (7 * courts.length) });
  }
  const sortedHours = [...byHour].sort((a, b) => b.rate - a.rate);
  const busiest = getBusiestSlot(30, taken);

  return [
    `Bookings last 7 days: ${bookings} (previous 7 days: ${sum(prev, "bookings")}, change ${(((bookings - prevBookings) / prevBookings) * 100).toFixed(1)}%).`,
    `Revenue last 7 days: $${revenue.toLocaleString()}.`,
    `Occupancy last 7 days: ${Math.round((bookings / slots) * 100)}% of all court hours.`,
    `Bookings per court last 7 days: ${ranked.map(([n, v]) => `${n} ${v}`).join(", ")}.`,
    `Most used court: ${ranked[0][0]}. Least used court: ${ranked[ranked.length - 1][0]}.`,
    `Busiest hours: ${sortedHours.slice(0, 3).map((h) => `${formatHour(h.hour)} (${Math.round(h.rate * 100)}%)`).join(", ")}.`,
    `Quietest hours: ${sortedHours.slice(-3).map((h) => `${formatHour(h.hour)} (${Math.round(h.rate * 100)}%)`).join(", ")}.`,
    busiest
      ? `Busiest weekday and hour overall: ${busiest.weekdayName} at ${busiest.hourLabel} (${busiest.occupancyPct}% full).`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * A realistic busy day used by the demo toggle, so a live walkthrough opens on
 * full looking analytics. Deterministic, and dated today so it lands at the top
 * of the recent bookings table.
 */
export function generateDemoBookings() {
  const rows = [];
  const today = new Date();
  const ds = toDateStr(today);
  const statuses = ["Confirmed", "Confirmed", "Confirmed", "Pending"];
  let n = 0;
  for (let hour = openHour; hour < closeHour; hour++) {
    for (const court of courts) {
      // busier in the evening, same shape as the seeded availability
      const bias = hour >= 17 ? 78 : hour >= 12 ? 46 : 26;
      if (hash(`demo${hour}${court.id}`) % 100 >= bias) continue;
      rows.push({
        ref: `RLY${7000 + n}`,
        customer: `${firstNames[hash(`dfn${n}`) % firstNames.length]} ${lastNames[hash(`dln${n}`) % lastNames.length]}`,
        court: court.name,
        courtId: court.id,
        date: ds,
        hour,
        price: court.price,
        status: statuses[hash(`dst${n}`) % statuses.length],
        source: "demo",
        createdAt: today.getTime() - n * 60_000,
      });
      n++;
    }
  }
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}
