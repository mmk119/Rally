# Rally · Padel Court Booking

A prototype built for the Ghaia.ai assessment: a small padel club website with an embedded AI assistant and two tabs — Analytics and Booking. All data and logic are mocked in the frontend; there is no backend.

## Run it

```
npm install
npm run dev
```

Optionally copy `.env.example` to `.env` and add an OpenAI API key so the chat bot uses a real model. Without a key the bot falls back to keyword and pattern matching, so the demo never breaks.

## What is inside

- **Analytics tab** — four KPI cards with trend indicators, an area chart plus a donut chart driven by a 7/30 day range control, and a sortable recent bookings table with status pills, a loading skeleton, an empty state, and an error state with retry.
- **Booking tab** — a four step flow: pick a day and hourly slot (available vs full states), choose a court, add details, confirm. Confirmation shows a booking reference with an animated check.
- **AI assistant** — floating chat available on both tabs, with a typing indicator, quick reply chips, and rich replies (booking confirmation cards and KPI snippet cards with a sparkline). It can complete a booking from free form messages like "book a court Friday at 3" and the Booking tab plus Analytics table reflect the result immediately.

## How the bot works

The bot sends the conversation to the OpenAI API (`gpt-4o-mini`) with a strict JSON schema, and receives back the reply text plus an action (`createBooking`, `showAnalytics`, or `none`). The app executes that action against the shared mock store, so both tabs stay in sync with the chat: a booking made from the chat appears immediately in the Booking tab and the recent bookings table. If the API call fails or no key is set, a keyword parser produces the same action shape so the demo never breaks. The chat header shows which mode is active.

## Seeing the states

The loading skeleton shows on load and whenever the date range changes. The empty state appears when a table search matches nothing. To see the table's error state, load `http://localhost:5173/?failTable=1` — the first fetch fails and Retry recovers it.

## Assumptions

- Slots are one hour, daily from 8:00 to 22:00, across four courts with different prices.
- Availability is deterministic (hash based) so the demo behaves the same on every run; evenings and weekends are busier.
- Bookings made in the session live in memory only and reset on refresh.
- The OpenAI key is exposed to the browser; acceptable for a mocked prototype, a real product would proxy the call through a backend.

## Design

Dark premium theme following fitness industry color research: a near black base with a green cast for power and a high end feel, one neon lime accent (#BEF264, the color of a padel ball) reserved for CTAs and key states, and high contrast text throughout. Typography is Barlow Condensed / Barlow, an athletic pairing recommended by the UI UX Pro Max design dataset for gyms and sports brands.

## Stack and AI tools

React + Vite, Tailwind CSS v4, Recharts, OpenAI API. Built with Claude Code, with a design pass driven by the UI UX Pro Max skill.
