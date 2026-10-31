import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFeedback, fetchFeedback } from "@/lib/civic";

export default function OfficerFeedbackSection({
  wardId,
  wardName,
}: {
  wardId: string;
  wardName: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    officer_name: "",
    designation: "Sanitary Inspector",
    message: "",
    risk_verified: true,
    observed_cases: 0,
  });

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["officer-feedback", wardId],
    queryFn: () => fetchFeedback(wardId),
  });

  const mutation = useMutation({
    mutationFn: () => createFeedback({ ward_id: wardId, ...form }),
    onSuccess: () => {
      setForm({
        officer_name: "",
        designation: "Sanitary Inspector",
        message: "",
        risk_verified: true,
        observed_cases: 0,
      });
      qc.invalidateQueries({ queryKey: ["officer-feedback", wardId] });
    },
  });

  return (
    <div className="panel p-5">
      <div className="mono-label">Officer field feedback — {wardName}</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Ground-truth from PMC sanitation and health staff, used to validate each model warning.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="mt-4 grid gap-3 rounded-md border border-border bg-secondary/40 p-4 sm:grid-cols-2"
      >
        <label className="text-xs">
          <span className="mono-label">Officer name</span>
          <input
            required
            minLength={2}
            value={form.officer_name}
            onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="text-xs">
          <span className="mono-label">Designation</span>
          <select
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option>Sanitary Inspector</option>
            <option>Medical Officer</option>
            <option>Junior Engineer</option>
            <option>Ward Officer</option>
            <option>ASHA Worker</option>
          </select>
        </label>
        <label className="text-xs sm:col-span-2">
          <span className="mono-label">Field observation</span>
          <textarea
            required
            minLength={5}
            rows={2}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What did the field team find?"
            className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="text-xs">
          <span className="mono-label">Cases observed</span>
          <input
            type="number"
            min={0}
            max={100000}
            value={form.observed_cases}
            onChange={(e) => setForm({ ...form, observed_cases: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.risk_verified}
            onChange={(e) => setForm({ ...form, risk_verified: e.target.checked })}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span>Model warning matched ground reality</span>
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving…" : "Submit feedback"}
          </button>
          {mutation.isError && (
            <span className="text-xs" style={{ color: "var(--risk-severe)" }}>
              {(mutation.error as Error).message}
            </span>
          )}
        </div>
      </form>

      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {isLoading && <p className="text-sm text-muted-foreground">Loading feedback…</p>}
        {!isLoading && feedback.length === 0 && (
          <p className="text-sm text-muted-foreground">No officer feedback for this ward yet.</p>
        )}
        {feedback.map((f) => (
          <div
            key={f.id}
            className="rounded-md border border-border bg-surface-raised/60 p-3"
            style={{
              borderLeft: `3px solid ${f.risk_verified ? "var(--risk-high)" : "var(--risk-low)"}`,
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">
                {f.officer_name} · {f.designation}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {f.risk_verified ? "Verified on site" : "Not observed"} · {f.observed_cases} cases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{f.message}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(f.created_at).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
