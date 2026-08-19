# Rally · Padel Court Booking

A prototype built for the Ghaia.ai assessment: a small padel club website with an embedded AI assistant and two tabs — Analytics and Booking. All data and logic are mocked in the frontend; there is no backend.

## Run it

```
npm install
npm run dev
```

Optionally copy `.env.example` to `.env` and add an OpenAI API key so the chat bot uses a real model. Without a key the bot falls back to keyword and pattern matching, so the demo never breaks.

## What is inside

- **Analytics tab** — four KPI cards whose numbers count up on load, an area chart plus a donut chart, an **occupancy heatmap** showing demand by court and hour, and a sortable recent bookings table with status pills, a loading skeleton, an empty state, and an error state with retry. A 7/30 day range control drives all of them.
- **Booking tab** — a four step flow beside a **live summary rail** that fills in as you choose, so the booking is reviewable at every step: pick a day and hourly slot (slots grouped into morning / afternoon / evening, with selected, open, and full states), choose a court, add details, confirm. Confirmation shows a booking reference with an animated check. Your bookings are listed below with a **cancel** action.

- **Cancelling** — any booking can be cancelled from the table row or the Booking tab, and every surface agrees instantly: the row restyles to a muted Cancelled pill with a struck through time, the slot frees up in the picker and heatmap, and the KPI cards and charts drop by exactly that booking. Cancels are reversible from an **undo toast** rather than gated behind a confirm dialog.
- **Coach, the AI assistant** — floating chat available on both tabs, with a typing indicator, quick reply chips, and rich replies (booking, cancellation, reschedule, and KPI snippet cards). Coach can:
  - **book** from free form messages like "book a court Friday at 3", with the new row flashing as it lands in the table;
  - **cancel**, always behind a confirmation card, and disambiguate by listing candidates when several bookings match;
  - **reschedule**, showing a before and after card;
  - **answer analytics questions from real numbers** — a live club digest travels with every request, so questions the KPI cards do not cover ("which court is underused?", "when are we quietest?") get truthful answers;
  - **highlight the heatmap**, dimming everything except the hour it is talking about;
  - **refuse impossible slots** gracefully, asking for a workable time instead of failing.

  **Chat mechanics**, built to feel like a real assistant rather than a form that answers:
  - replies **arrive a few characters at a time** with a caret, and the rich card only lands once the sentence has finished;
  - the indicator **names the task it is doing** — "Checking availability", "Finding that booking", "Pulling the club numbers" — picked from the same intent words the offline parser keys on, so the label is never a lie;
  - a **stop button** replaces send while Coach is working: it aborts the in-flight request (`AbortSignal`) so a withdrawn question never answers itself, or skips the reveal if the reply has already arrived;
  - **Enter sends, Shift+Enter starts a new line**, in an auto-growing textarea;
  - **timestamps** on every message and a **copy** action on Coach's replies;
  - the transcript only auto-scrolls when you are already at the bottom, with a **jump to latest** pill when you are not, so scrolling back to re-read something is never yanked away;
  - the header dot and label tell the truth about the connection — online, working, or dropped to the offline playbook — and a banner appears when Coach falls back.

  The first time you open it in a session Coach **volunteers one insight computed from the booking data** — the busiest weekday and hour, and how full it runs — rather than a canned line, with a pulse on the launcher inviting the click.

- **Demo mode** — a subtle "Demo data" toggle in the side rail (top bar on phones) preloads a full day of bookings so the analytics, heatmap, and table look busy instantly for a live walkthrough. Toggling it off restores the default seeded data.

## How the bot works

The bot sends the conversation to the OpenAI API (`gpt-4o-mini`) with a strict JSON schema, plus a live digest of the club's real numbers, and receives back the reply text plus an action (`createBooking`, `cancelBooking`, `rescheduleBooking`, `showAnalytics`, or `none`). The app executes that action against the shared mock store, so every surface stays in sync with the chat. Destructive actions are always confirmed in the UI before anything is removed, and the app validates the model's slot before acting, so an out of hours or past date becomes a question rather than a bad booking. If the API call fails or no key is set, a keyword parser produces the same action shape so the demo never breaks. The chat header shows which mode is active.

**One source of truth.** The slot picker, heatmap, KPI cards, charts, and bookings table all read the same occupancy predicate in `store.jsx`. That is why a booking or a cancellation moves every number on screen at once instead of only the table.

## Seeing the states

The loading skeleton shows on load and whenever the date range changes. The empty state appears when a table search matches nothing. To see the table's error state, add `?failTable=1` to the dev server URL — the first fetch fails and Retry recovers it.

## Assumptions

- Slots are one hour, daily from 8:00 to 22:00, across four courts with different prices.
- Availability is deterministic (hash based) so the demo behaves the same on every run; evenings and weekends are busier.
- Bookings made in the session live in memory only and reset on refresh.
- The OpenAI key is exposed to the browser; acceptable for a mocked prototype, a real product would proxy the call through a backend.

## Design

Dark premium theme following fitness industry color research: a near black base with a green cast for power and a high end feel, one neon lime accent (#BEF264, the color of a padel ball) reserved for CTAs and key states, and high contrast text throughout. Typography is Barlow Condensed / Barlow, an athletic pairing recommended by the UI UX Pro Max design dataset for gyms and sports brands.

The palette is defined once as design tokens in `src/index.css` and used everywhere: layered surfaces (`#0B0F0C` base, `#141A16` card, `#1B2320` raised), three text weights, muted status colors so only the lime pops, hairline borders, and a single radius language across cards, inputs, buttons, and pills.

**Layout.** A persistent left rail carries the club crest, both destinations, the primary CTA, and the demo toggle; below `md` it becomes a bottom tab bar with a slim brand header, so nothing is lost on a phone. Cards are translucent glass rather than solid blocks.

**Photography.** Three local shots from `pics/` are used as real assets, all bundled by Vite (no external image hosts, so the prototype works offline):

| Asset | Where | Technique |
| --- | --- | --- |
| `2.jpg` — rim-lit ball on black | fixed page backdrop, top right | `mix-blend-mode: screen` drops the black ground so only the lit rim reads, like an arena light in the corner; masked and held at low opacity so header controls in front of it keep their contrast |
| `5.png` — ball with bokeh | corner of the booking Summary card | same screen composite, plus a horizontal scrim so the DATE and TIME values stay legible over it |
| `3.jpg` — padel crest | side rail brand lockup | supplied as black art on white, so it is inverted and screen composited; shown at 64px, since its laurel and racket detail turns to mush any smaller |

Behind the photography sits a CSS wash — two soft lime pools and a faint court line grid — so the background still has depth in the areas the images do not reach.

**Motion**, deliberately restrained: KPI numbers count up, dashboard sections rise in on a short stagger, a new booking row flashes lime as it lands, the confirmation check draws itself, and the selected slot lifts and glows. Everything is disabled under `prefers-reduced-motion`.

## Stack and AI tools

React + Vite, Tailwind CSS v4, Recharts, OpenAI API. Built with Claude Code, with a design pass driven by the UI UX Pro Max skill.
