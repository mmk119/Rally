import { useMemo, useState } from "react";
import { useApp } from "../../store";
import { courts, openHour, closeHour, toDateStr, formatDate, formatHour } from "../../data/mockData";

const steps = ["Date & time", "Court", "Details", "Confirm"];

function Stepper({ current }) {
  return (
    // labels collapse below sm so the stepper never forces horizontal scroll on phones
    <ol className="flex items-center gap-1.5 text-xs font-semibold sm:gap-2">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
              i < current
                ? "bg-lime-pop text-night"
                : i === current
                ? "bg-rally-100 text-rally-800 ring-2 ring-rally-500"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span
            className={`${i === current ? "text-ink" : "text-slate-400"} ${
              i === current ? "whitespace-nowrap" : "hidden sm:inline"
            }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px w-3 bg-slate-200 sm:w-6" />}
        </li>
      ))}
    </ol>
  );
}

function SuccessScreen({ booking, onDone }) {
  return (
    <div className="popIn mx-auto max-w-md rounded-3xl border border-slate-200 bg-card p-8 text-center shadow-sm">
      <svg viewBox="0 0 100 100" className="mx-auto h-24 w-24">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth="5" className="checkCircle" />
        <path d="M32 52l13 13 24-28" fill="none" stroke="#bef264" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="checkMark" />
      </svg>
      <h2 className="mt-4 font-display text-xl font-bold">You're on the court!</h2>
      <p className="mt-1 text-sm text-slate-500">
        {booking.court} · {formatDate(booking.date)} at {formatHour(booking.hour)}
      </p>
      <div className="mt-5 rounded-2xl bg-rally-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-rally-700">Booking reference</p>
        <p className="font-mono text-lg font-bold text-rally-900">{booking.ref}</p>
      </div>
      <p className="mt-3 text-xs text-slate-400">A confirmation was added to Recent bookings in Analytics.</p>
      <button
        onClick={onDone}
        className="mt-6 w-full rounded-full bg-lime-pop py-2.5 text-sm font-bold text-night transition hover:bg-lime-glow"
      >
        Book another court
      </button>
    </div>
  );
}

export default function BookingTab() {
  const { isSlotTaken, addBooking, userBookings } = useApp();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(null);
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

  const reset = () => {
    setStep(0);
    setDate(null);
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
    const booking = addBooking({ courtId, date, hour, customer: name.trim(), players, notes, source: "form" });
    setConfirmed(booking);
  };

  if (confirmed) return <SuccessScreen booking={confirmed} onDone={reset} />;

  const selectedCourt = courts.find((c) => c.id === courtId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Book a court</h1>
          <p className="text-sm text-slate-500">Pick a slot, choose your court, and you're in.</p>
        </div>
        <Stepper current={step} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
        {step === 0 && (
          <div className="slideUp space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-bold">Choose a day</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => (
                  <button
                    key={d.str}
                    onClick={() => {
                      setDate(d.str);
                      setHour(null);
                    }}
                    className={`flex min-w-14 flex-col items-center rounded-2xl border px-3 py-2.5 transition ${
                      date === d.str
                        ? "border-lime-pop bg-lime-pop text-night shadow shadow-lime-pop/20"
                        : "border-slate-200 bg-card text-slate-600 hover:border-rally-300 hover:bg-rally-50"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase opacity-80">{d.isToday ? "Today" : d.weekday}</span>
                    <span className="font-display text-lg font-bold">{d.day}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Choose a start time</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rally-500" /> Available</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Full</span>
                </div>
              </div>
              {!date ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">Pick a day first to see times.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {hours.map((h) => {
                    const left = courts.filter((c) => !isSlotTaken(date, h, c.id)).length;
                    const full = left === 0;
                    return (
                      <button
                        key={h}
                        disabled={full}
                        onClick={() => setHour(h)}
                        className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                          full
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                            : hour === h
                            ? "border-lime-pop bg-lime-pop text-night shadow shadow-lime-pop/20"
                            : "border-slate-200 text-slate-700 hover:border-rally-400 hover:bg-rally-50"
                        }`}
                      >
                        {formatHour(h)}
                        {!full && left <= 2 && (
                          <span className={`mt-0.5 block text-[10px] font-bold ${hour === h ? "text-night/70" : "text-amber-300"}`}>
                            {left} court{left > 1 ? "s" : ""} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                disabled={!date || hour === null}
                onClick={() => setStep(1)}
                className="rounded-full bg-lime-pop px-6 py-2.5 text-sm font-bold text-night transition enabled:hover:bg-lime-glow disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="slideUp space-y-6">
            <h3 className="text-sm font-bold">
              Courts for {formatDate(date)} at {formatHour(hour)}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {courts.map((c) => {
                const taken = isSlotTaken(date, hour, c.id);
                return (
                  <button
                    key={c.id}
                    disabled={taken}
                    onClick={() => setCourtId(c.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                      taken
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                        : courtId === c.id
                        ? "border-lime-pop bg-rally-50 ring-2 ring-lime-pop"
                        : "border-slate-200 hover:border-rally-400 hover:bg-rally-50/50"
                    }`}
                  >
                    <div>
                      <p className="font-display font-bold">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.type} · glass walls · LED lighting</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-rally-800">${c.price}</p>
                      <p className={`text-xs font-semibold ${taken ? "text-slate-400" : "text-rally-600"}`}>
                        {taken ? "Full" : "Available"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
                Back
              </button>
              <button
                disabled={!courtId}
                onClick={() => setStep(2)}
                className="rounded-full bg-lime-pop px-6 py-2.5 text-sm font-bold text-night transition enabled:hover:bg-lime-glow disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="slideUp space-y-5">
            <h3 className="text-sm font-bold">A couple of details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">Name on the booking</span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Maya Haddad"
                  className={`w-full rounded-xl border bg-raised px-4 py-2.5 text-sm outline-none transition focus:border-rally-500 ${
                    error ? "border-red-400 bg-red-400/10" : "border-slate-200"
                  }`}
                />
                {error && <span className="mt-1 block text-xs font-medium text-red-300">{error}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">Players</span>
                <div className="flex gap-2">
                  {[2, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlayers(p)}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                        players === p
                          ? "border-lime-pop bg-rally-50 text-rally-800"
                          : "border-slate-200 text-slate-500 hover:border-rally-300"
                      }`}
                    >
                      {p} players
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">Notes (optional)</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Need rental rackets, beginner friendly…"
                className="w-full rounded-xl border border-slate-200 bg-raised px-4 py-2.5 text-sm outline-none transition focus:border-rally-500"
              />
            </label>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
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
                className="rounded-full bg-lime-pop px-6 py-2.5 text-sm font-bold text-night transition hover:bg-lime-glow"
              >
                Review booking
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="slideUp mx-auto max-w-md space-y-5">
            <h3 className="text-center text-sm font-bold">Confirm your booking</h3>
            <div className="space-y-3 rounded-2xl bg-slate-50 p-5 text-sm">
              {[
                ["Court", `${selectedCourt.name} · ${selectedCourt.type}`],
                ["When", `${formatDate(date)} at ${formatHour(hour)}`],
                ["Booked for", `${name || "—"} · ${players} players`],
                ["Price", `$${selectedCourt.price} for 60 min`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-right font-semibold">{v}</span>
                </div>
              ))}
              {notes && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Notes</span>
                  <span className="text-right font-medium text-slate-600">{notes}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
                Back
              </button>
              <button
                onClick={confirm}
                className="rounded-full bg-lime-pop px-8 py-2.5 text-sm font-bold text-night shadow-lg shadow-lime-pop/25 transition hover:bg-lime-glow"
              >
                Confirm booking
              </button>
            </div>
          </div>
        )}
      </div>

      {userBookings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Your upcoming bookings</h3>
          <div className="space-y-2">
            {userBookings.map((b) => (
              <div key={b.ref} className="flex items-center justify-between rounded-xl bg-rally-50/60 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-rally-700">{b.ref}</span>
                  <span className="font-semibold">{b.court}</span>
                  <span className="text-slate-500">
                    {formatDate(b.date)} · {formatHour(b.hour)}
                  </span>
                </div>
                <span className="flex items-center gap-2 text-xs font-semibold text-rally-700">
                  {b.source === "chat" && (
                    <span className="rounded-full bg-rally-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">via chat</span>
                  )}
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
