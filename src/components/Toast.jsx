/**
 * Brief inline feedback banner (e.g. "job discarded, searching for a
 * replacement"). Auto-dismiss timing is controlled by the parent.
 */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-100 shadow-lg">
      {message}
    </div>
  );
}
