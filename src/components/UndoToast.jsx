import { useApp } from "../store";

/**
 * Cancellations are reversible for a few seconds rather than gated behind a
 * confirm dialog: faster to use, and nothing is lost by accident.
 */
export default function UndoToast() {
  const { toast, restoreBooking, dismissToast } = useApp();
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      // sits above the mobile tab bar, drops to the corner-adjacent spot on desktop
      className="slideUp fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-hairline bg-raised py-2 pl-4 pr-2 shadow-2xl shadow-black/60 md:bottom-6"
    >
      <span className="text-sm text-ink">{toast.message}</span>
      {toast.actionLabel && (
        <button
          onClick={() => {
            restoreBooking(toast.ref);
            dismissToast();
          }}
          className="rounded-full bg-lime-pop px-3 py-1 text-xs font-bold text-night transition-colors duration-150 hover:bg-lime-glow"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={dismissToast}
        aria-label="Dismiss"
        className="flex h-6 w-6 items-center justify-center rounded-full text-faint transition-colors duration-150 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
