"use client";

import { useState } from "react";

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [feedback, setFeedback] = useState("");
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setFeedback("Tautan siap dibagikan.");
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback("Tautan disalin.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback("Tautan belum dapat dibagikan.");
    }
  };
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 hover:bg-neutral-50"
      >
        Bagikan produk
      </button>
      <p
        className="mt-2 text-sm text-neutral-600"
        role="status"
        aria-live="polite"
      >
        {feedback}
      </p>
    </div>
  );
}
