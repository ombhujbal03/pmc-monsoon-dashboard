import { useMemo, useState } from "react";
import logo from "@/assets/pmc-logo.png";
import {
  ROLE_LABEL,
  isEmployeeId,
  isGovEmail,
  isMobile,
  isPin,
  makeCaptcha,
  makeOtp,
  type Role,
  type Session,
} from "@/lib/session";

const ROLES: Role[] = ["citizen", "field", "command"];

export default function RoleLogin({
  onSignIn,
  onBrowsePublic,
}: {
  onSignIn: (s: Session) => void;
  onBrowsePublic: () => void;
}) {
  const [tab, setTab] = useState<Role>("citizen");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border">
          <img
            src={logo}
            alt="Pune Municipal Corporation emblem"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        </div>
        <p className="mono-label mb-2">Pune Municipal Corporation · Public Health Cell</p>
        <h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
          Monsoon Health Risk Mapping
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">PMC Edition</p>
      </div>

      <div className="panel rounded-xl p-6 shadow-soft">
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setTab(r)}
              className={`rounded-md px-2 py-2 text-xs font-semibold transition-all ${
                tab === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "citizen" && <CitizenForm onSignIn={onSignIn} onBrowsePublic={onBrowsePublic} />}
          {tab === "field" && <FieldForm onSignIn={onSignIn} />}
          {tab === "command" && <CommandForm onSignIn={onSignIn} />}
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Demo access control: OTPs and passwords are validated in-browser for the prototype. Connect
        the PMC SMS gateway and staff directory before field deployment.
      </p>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/50";
const btn =
  "w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/10 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60";
const label = "mono-label mb-2 block";

function Err({ children }: { children: string }) {
  return <p className="text-xs" style={{ color: "var(--risk-severe)" }}>{children}</p>;
}

function CitizenForm({
  onSignIn,
  onBrowsePublic,
}: {
  onSignIn: (s: Session) => void;
  onBrowsePublic: () => void;
}) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Viewing the ward advisory map needs no login. Verify your mobile only to submit a
        waterlogging grievance.
      </p>
      <button
        onClick={onBrowsePublic}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        Continue without login — view advisory map
      </button>

      <div className="border-t border-border pt-4">
        <div className={label}>Mobile number</div>
        <input
          className={input}
          inputMode="numeric"
          placeholder="10-digit mobile"
          value={mobile}
          maxLength={10}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      {sent && (
        <div>
          <div className={label}>Enter OTP (demo code {sent})</div>
          <input
            className={input}
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      )}

      {error && <Err>{error}</Err>}

      {!sent ? (
        <button
          className={btn}
          onClick={() => {
            if (!isMobile(mobile)) return setError("Enter a valid 10-digit Indian mobile number.");
            setError("");
            setSent(makeOtp());
          }}
        >
          Send OTP
        </button>
      ) : (
        <button
          className={btn}
          onClick={() => {
            if (otp !== sent) return setError("Incorrect OTP.");
            onSignIn({ role: "citizen", label: `+91 ${mobile}` });
          }}
        >
          Verify & report
        </button>
      )}
    </div>
  );
}

function FieldForm({ onSignIn }: { onSignIn: (s: Session) => void }) {
  const [empId, setEmpId] = useState("");
  const [mobile, setMobile] = useState("");
  const [mode, setMode] = useState<"otp" | "pin">("otp");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <div className={label}>PMC Employee ID</div>
        <input
          className={input}
          placeholder="PMC-FW-8422"
          value={empId}
          onChange={(e) => setEmpId(e.target.value.toUpperCase())}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
        {(["otp", "pin"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === m ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {m === "otp" ? "Mobile + OTP" : "4-digit PIN"}
          </button>
        ))}
      </div>

      {mode === "otp" ? (
        <>
          <div>
            <div className={label}>Mobile number</div>
            <input
              className={input}
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {sent && (
            <div>
              <div className={label}>Enter OTP (demo code {sent})</div>
              <input
                className={input}
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}
        </>
      ) : (
        <div>
          <div className={label}>Crew PIN (demo: 4 digits)</div>
          <input
            className={input}
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      )}

      {error && <Err>{error}</Err>}

      {mode === "pin" ? (
        <button
          className={btn}
          onClick={() => {
            if (!isEmployeeId(empId)) return setError("Employee ID must look like PMC-FW-8422.");
            if (!isPin(pin)) return setError("Enter your 4-digit crew PIN.");
            onSignIn({ role: "field", label: empId });
          }}
        >
          Enter dispatch board
        </button>
      ) : !sent ? (
        <button
          className={btn}
          onClick={() => {
            if (!isEmployeeId(empId)) return setError("Employee ID must look like PMC-FW-8422.");
            if (!isMobile(mobile)) return setError("Enter a valid 10-digit mobile number.");
            setError("");
            setSent(makeOtp());
          }}
        >
          Send OTP
        </button>
      ) : (
        <button
          className={btn}
          onClick={() => {
            if (otp !== sent) return setError("Incorrect OTP.");
            onSignIn({ role: "field", label: empId });
          }}
        >
          Enter dispatch board
        </button>
      )}
    </div>
  );
}

function CommandForm({ onSignIn }: { onSignIn: (s: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(() => makeCaptcha());
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const strong = useMemo(() => password.length >= 8, [password]);

  return (
    <div className="space-y-4">
      <div>
        <div className={label}>Official government email</div>
        <input
          className={input}
          placeholder="officer.name@pmc.gov.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <div className={label}>High-security password</div>
        <input
          className={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && !strong && <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters.</p>}
      </div>
      <div>
        <div className={label}>Captcha — what is {captcha.question}?</div>
        <input
          className={input}
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      {error && <Err>{error}</Err>}

      <button
        className={btn}
        onClick={() => {
          if (!isGovEmail(email)) return setError("Use your official @pmc.gov.in address.");
          if (!strong) return setError("Password must be at least 8 characters.");
          if (answer !== captcha.answer) {
            setCaptcha(makeCaptcha());
            setAnswer("");
            return setError("Captcha incorrect — try the new one.");
          }
          onSignIn({ role: "command", label: email });
        }}
      >
        Sign in to Command Center
      </button>
    </div>
  );
}
