"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAffordance() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);
  if (!promptEvent || dismissed) return null;
  const install = async () => {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setMessage(
      choice.outcome === "accepted"
        ? "Aplikasi dipasang."
        : "Pemasangan dibatalkan.",
    );
    setPromptEvent(null);
  };
  return (
    <div className="fixed right-4 bottom-4 z-40 max-w-xs rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={install}
          className="min-h-11 rounded-md bg-brand-600 px-4 font-semibold text-white"
        >
          Pasang aplikasi
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Tutup tawaran pemasangan"
          className="min-h-11 rounded-md px-3 font-semibold text-neutral-600"
        >
          Tutup
        </button>
      </div>
      <p role="status" className="mt-1 text-xs text-neutral-600">
        {message}
      </p>
    </div>
  );
}
