import { useEffect, useState } from "react";

export type Role = "citizen" | "field" | "command";

export type Session = {
  role: Role;
  label: string; // display identity
  wardId?: string;
};

export const ROLE_LABEL: Record<Role, string> = {
  citizen: "Citizen",
  field: "Field Staff",
  command: "Command Center",
};

const KEY = "pmc-session";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pmc-session-change"));
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    setReady(true);
    window.addEventListener("pmc-session-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pmc-session-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { session, ready, signIn: (s: Session) => writeSession(s), signOut: () => writeSession(null) };
}

/* ---------- demo verification helpers (no SMS gateway wired yet) ---------- */

export const isMobile = (v: string) => /^[6-9]\d{9}$/.test(v.trim());
export const isEmployeeId = (v: string) => /^PMC-[A-Z]{2}-\d{4}$/i.test(v.trim());
export const isGovEmail = (v: string) => /^[\w.+-]+@pmc\.gov\.in$/i.test(v.trim());
export const isPin = (v: string) => /^\d{4}$/.test(v.trim());

export function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function makeCaptcha() {
  const a = 3 + Math.floor(Math.random() * 9);
  const b = 2 + Math.floor(Math.random() * 8);
  return { question: `${a} + ${b}`, answer: String(a + b) };
}
