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

// Daily totals for the last N days, used by KPI cards and the trend chart.
export function generateHistory(days) {
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
        if (isSlotPreBooked(ds, h, c.id)) count++;
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
