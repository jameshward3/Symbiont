"use client";

import { signOut, useSession } from "next-auth/react";

function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ID";
  return `${parts[0][0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function AccountControl() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="avatar account-loading" aria-label="Loading account">••</div>;
  }

  if (!session?.user) return null;

  const displayName = session.user.name || session.user.email || "Authorized user";

  return (
    <div className="account-control">
      <div className="account-copy">
        <span>Microsoft Entra</span>
        <strong>{displayName}</strong>
      </div>
      <button
        className="avatar account-avatar"
        type="button"
        title={`Sign out ${displayName}`}
        onClick={() => signOut({ redirectTo: "/signin" })}
      >
        {initials(displayName)}
      </button>
    </div>
  );
}
