"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function SignInPanel({ configured }: { configured: boolean }) {
  const { data: session, status } = useSession();
  const [pending, setPending] = useState(false);

  if (status === "authenticated" && session.user) {
    return (
      <div className="signin-actions">
        <p className="signin-status">Signed in as {session.user.email || session.user.name}.</p>
        <Link className="signin-primary" href="/">Open Command Center</Link>
        <button type="button" className="signin-secondary" onClick={() => signOut({ redirectTo: "/signin" })}>Sign out</button>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="signin-actions">
        <p className="signin-status error">Microsoft Entra authentication is not configured for this deployment.</p>
        <span className="signin-help">Add the required <code>AUTH_*</code> secrets and redeploy.</span>
      </div>
    );
  }

  return (
    <div className="signin-actions">
      <button
        type="button"
        className="signin-primary"
        disabled={pending || status === "loading"}
        onClick={() => {
          setPending(true);
          const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/";
          void signIn("microsoft-entra-id", { redirectTo: callbackUrl });
        }}
      >
        {pending ? "Opening Microsoft…" : "Continue with Microsoft"}
      </button>
      <span className="signin-help">Use an account assigned to the Symbiont enterprise application.</span>
    </div>
  );
}
