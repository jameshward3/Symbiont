import { isMicrosoftEntraConfigured } from "@/lib/entra-config";
import { SignInPanel } from "./signin-panel";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <main className="signin-shell">
      <section className="signin-card">
        <div className="signin-brand">
          <div className="brand-mark">S</div>
          <div><strong>SYMBIONT</strong><span>OPERATING SYSTEM</span></div>
        </div>
        <p className="eyebrow">Protected command center</p>
        <h1>Authorized access only.</h1>
        <p className="signin-intro">Sign in through Microsoft Entra ID. Tenant membership and enterprise-app assignment govern access; consequential actions still require the platform’s existing human approval controls.</p>
        <SignInPanel configured={isMicrosoftEntraConfigured()} />
        <footer>OIDC session · 8-hour maximum · server-side authorization</footer>
      </section>
    </main>
  );
}
