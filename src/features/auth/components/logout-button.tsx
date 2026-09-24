"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export const LogoutButton = () => {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        void signOut({ callbackUrl: "/" });
      }}
      className="min-h-11 rounded-md border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-60"
    >
      {isPending ? "Keluar..." : "Logout"}
    </button>
  );
};
