import { courts, openHour, closeHour, toDateStr } from "../data/mockData";

// Demo only: the key ships to the browser, acceptable for this prototype since there is no backend.
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

const responseSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "Short friendly reply to show the user. One or two sentences.",
    },
    action: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["createBooking", "showAnalytics", "none"] },
        date: { type: "string", description: "Booking date as YYYY-MM-DD, empty if not a booking" },
        hour: { type: "integer", description: "Booking start hour 8 to 21 in 24h time, 0 if not a booking" },
        court: { type: "string", enum: ["Court 1", "Court 2", "Court 3", "Court 4", "any"] },
        metric: { type: "string", enum: ["bookings", "revenue", "occupancy", "peak", "none"] },
      },
      required: ["type", "date", "hour", "court", "metric"],
      additionalProperties: false,
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
      description: "Up to 3 short quick reply chips relevant to the conversation",
    },
  },
  required: ["reply", "action", "suggestions"],
  additionalProperties: false,
};

function systemPrompt() {
  const today = new Date();
  return `You are Coach, the assistant embedded in Rally, a padel court booking website.

Voice: warm, encouraging, and lightly padel-flavoured, but professional and concise. One short personable line, never a paragraph. A confirmation should read like "Booked! Court 3, Friday 3 PM. Bring your A-game." Use a light touch: an occasional nod to the game is good, constant puns are not. Never use exclamation marks more than once in a reply.

Today is ${today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} (${toDateStr(today)}).

Facts about Rally:
- Courts: ${courts.map((c) => `${c.name} (${c.type}, $${c.price}/hr)`).join(", ")}.
- Open daily, hourly slots from ${openHour}:00 to ${closeHour}:00 (last start ${closeHour - 1}:00).
- The site has two tabs: Analytics (KPIs, charts, recent bookings) and Booking (slot picker).

Your job: understand the user's message and return a structured action.
- If they want to book a court ("book a court friday at 3", "reserve tomorrow evening"), return action type createBooking with the resolved date (YYYY-MM-DD, never in the past), hour (24h integer within opening hours; interpret bare small numbers like "at 3" as afternoon, i.e. 15), and court ("any" unless they name one). Do NOT invent details they did not give, except resolving relative dates and am/pm.
- If they ask how the club is doing ("how are bookings", "revenue this week", "busiest time"), return action type showAnalytics with the closest metric.
- Otherwise action type none. Answer questions about prices, hours, and courts yourself from the facts above.
- If a message is ambiguous about the day or time for a booking, ask one clarifying question and use action type none.
Keep replies to one or two sentences; the app renders rich cards for you, so never repeat booking reference numbers or chart data in the text.`;
}

/** Court and time are filled in by the caller once the slot is actually resolved. */
export function coachConfirmation(courtName, dayLabel, hourLabel) {
  const closers = [
    "Bring your A-game.",
    "Go get it.",
    "Enjoy the run.",
    "Have a good hit.",
  ];
  const closer = closers[Math.floor(Math.random() * closers.length)];
  return `Booked! ${courtName}, ${dayLabel} ${hourLabel}. ${closer}`;
}

export async function askAssistant(history) {
  if (!openaiKey) throw new Error("noApiKey");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 600,
      response_format: {
        type: "json_schema",
        json_schema: { name: "rallyAction", strict: true, schema: responseSchema },
      },
      messages: [
        { role: "system", content: systemPrompt() },
        ...history.map((m) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text,
        })),
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

/* ---------- offline fallback: keyword and pattern matching ---------- */

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function resolveDay(text) {
  const today = new Date();
  const lower = text.toLowerCase();
  if (lower.includes("today")) return toDateStr(today);
  if (lower.includes("tomorrow")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toDateStr(d);
  }
  for (let i = 0; i < 7; i++) {
    if (lower.includes(dayNames[i])) {
      const d = new Date(today);
      const delta = (i - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + delta);
      return toDateStr(d);
    }
  }
  const iso = lower.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  return null;
}

function resolveHour(text) {
  const lower = text.toLowerCase();
  const m = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  if (h < 0 || h > 23) return null;
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (!m[3] && h >= 1 && h <= 7) h += 12; // "at 3" means 3pm
  if (lower.includes("evening") && h < 12) h += 12;
  if (h < openHour || h >= closeHour) return null;
  return h;
}

function resolveCourt(text) {
  const m = text.toLowerCase().match(/court\s*([1-4])/);
  return m ? `Court ${m[1]}` : "any";
}

export function fallbackReply(text) {
  const lower = text.toLowerCase();
  const none = { type: "none", date: "", hour: 0, court: "any", metric: "none" };

  if (/\b(book|reserve|reservation|booking)\b/.test(lower)) {
    const date = resolveDay(lower);
    const hour = resolveHour(lower.replace(/court\s*[1-4]/g, ""));
    if (date && hour) {
      return {
        // the widget replaces this with a Coach style confirmation once the slot resolves
        reply: "On it, locking that in for you.",
        action: { type: "createBooking", date, hour, court: resolveCourt(lower), metric: "none" },
        suggestions: ["How are bookings this week?", "Show revenue"],
      };
    }
    return {
      reply: "Happy to get you on court. Which day and time suits? For example: Friday at 3pm.",
      action: none,
      suggestions: ["Book a court tomorrow at 6pm", "Book Court 4 Friday at 3pm"],
    };
  }

  if (/\b(revenue|earning|income)\b/.test(lower)) {
    return { reply: "Here is how the takings are shaping up.", action: { ...none, type: "showAnalytics", metric: "revenue" }, suggestions: ["Show occupancy", "Book a court tomorrow at 6pm"] };
  }
  if (/\b(occupancy|utilization|full)\b/.test(lower)) {
    return { reply: "Here is how full the courts are running.", action: { ...none, type: "showAnalytics", metric: "occupancy" }, suggestions: ["Show revenue", "Book a court Friday at 3pm"] };
  }
  if (/\b(busy|busiest|peak)\b/.test(lower)) {
    return { reply: "Evenings are your rush hour. Here are the numbers.", action: { ...none, type: "showAnalytics", metric: "peak" }, suggestions: ["How are bookings this week?", "Book a court tonight at 8pm"] };
  }
  if (/\b(bookings|doing|stats|analytics|performance)\b/.test(lower)) {
    return { reply: "Here is a quick pulse on the club.", action: { ...none, type: "showAnalytics", metric: "bookings" }, suggestions: ["Show revenue", "Book a court tomorrow at 6pm"] };
  }
  if (/\b(price|cost|how much|rate)\b/.test(lower)) {
    return {
      reply: `Courts run $${Math.min(...courts.map((c) => c.price))} to $${Math.max(...courts.map((c) => c.price))} per hour: ${courts.map((c) => `${c.name} $${c.price}`).join(", ")}.`,
      action: none,
      suggestions: ["Book a court Friday at 3pm", "How are bookings this week?"],
    };
  }
  if (/\b(hour|open|close|when)\b/.test(lower)) {
    return { reply: `Courts are open daily from ${openHour}:00 to ${closeHour}:00, in one hour slots.`, action: none, suggestions: ["Book a court tomorrow at 6pm"] };
  }
  if (/\b(hi|hello|hey)\b/.test(lower)) {
    return { reply: "Hey, Coach here. I can get you on court or pull up the club numbers.", action: none, suggestions: ["Book a court Friday at 3pm", "How are bookings this week?"] };
  }
  return {
    reply: "I can book courts and read the club numbers. Try: book a court Friday at 3pm.",
    action: none,
    suggestions: ["Book a court Friday at 3pm", "How are bookings this week?", "Show revenue"],
  };
}

export const hasApiKey = Boolean(openaiKey);
