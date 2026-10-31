import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/pmc-logo.png";
import RoleLogin from "@/components/RoleLogin";
import CommandCenter from "@/components/CommandCenter";
import FieldOps from "@/components/FieldOps";
import PublicPortal from "@/components/PublicPortal";
import { ROLE_LABEL, useSession, type Session } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monsoon Health Risk Mapping — PMC Edition" },
      {
        name: "description",
        content:
          "Role-based Pune monsoon disease risk platform: public ward advisories, field dispatch orders and the municipal command centre predictive dashboard.",
      },
      { property: "og:title", content: "Monsoon Health Risk Mapping — PMC Edition" },
      {
        property: "og:description",
        content:
          "Citizen advisories, field crew dispatch checklists and command-centre outbreak prediction for all 15 PMC ward offices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shell,
});

function Shell() {
  const { session, ready, signIn, signOut } = useSession();
  const [guestPublic, setGuestPublic] = useState(false);

  if (!ready) return <div className="min-h-screen" />;

  const showLogin = !session && !guestPublic;

  if (showLogin) {
    return (
      <RoleLogin
        onSignIn={(s: Session) => {
          setGuestPublic(false);
          signIn(s);
        }}
        onBrowsePublic={() => setGuestPublic(true)}
      />
    );
  }

  const role = session?.role ?? "citizen";

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Pune Municipal Corporation emblem" width={44} height={44} className="h-11 w-11" loading="lazy" />
            <div>
              <div className="mono-label">
                {role === "command"
                  ? "Municipal Command · Strategic View"
                  : role === "field"
                    ? "Field Operations · Tactical View"
                    : "Public Portal · Advisory View"}
              </div>
              <h1 className="font-serif text-xl tracking-tight">
                Monsoon Health Risk Mapping — PMC Edition
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-muted-foreground">
              {session ? `${ROLE_LABEL[role]} · ${session.label}` : "Guest · public advisory"}
            </span>
            <button
              onClick={() => {
                signOut();
                setGuestPublic(false);
              }}
              className="rounded-full border border-border px-3 py-1.5 font-semibold hover:bg-secondary"
            >
              {session ? "Sign out" : "Sign in"}
            </button>
          </div>
        </div>
      </header>

      {role === "command" && <CommandCenter />}
      {role === "field" && session && <FieldOps session={session} />}
      {role === "citizen" && (
        <PublicPortal session={session} onRequestVerify={() => setGuestPublic(false)} />
      )}

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-xs text-muted-foreground">
        {role === "command"
          ? "Predictions are model estimates from rainfall/humidity forecasts and PMC civic complaint density — confirm with field inspection before dispatch."
          : "Advisories are precautionary guidance issued by the PMC Public Health Cell."}
      </footer>
    </div>
  );
}
