import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CATEGORY_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
  createComplaint,
  fetchComplaints,
} from "@/lib/civic";

const severityColor = (s: string) =>
  s === "high" ? "var(--risk-severe)" : s === "medium" ? "var(--risk-moderate)" : "var(--risk-low)";

export default function ComplaintsSection({
  wardId,
  wardName,
}: {
  wardId: string;
  wardName: string;
}) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "water_stagnation",
    locality: "",
    description: "",
    severity: "medium",
  });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", wardId],
    queryFn: () => fetchComplaints(wardId),
  });

  const mutation = useMutation({
    mutationFn: () => createComplaint({ ward_id: wardId, ...form }),
    onSuccess: () => {
      setForm({ category: "water_stagnation", locality: "", description: "", severity: "medium" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["complaints", wardId] });
      qc.invalidateQueries({ queryKey: ["complaint-counts"] });
    },
  });

  const rows = complaints.filter((c) => filter === "all" || c.status === filter);
  const openCount = complaints.filter((c) => c.status !== "resolved").length;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mono-label">Civic complaints — {wardName}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {openCount} unresolved of {complaints.length} logged · PMC Open Data + citizen reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-input bg-secondary px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {open ? "Cancel" : "File complaint"}
          </button>
        </div>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-4 grid gap-3 rounded-md border border-border bg-secondary/40 p-4 sm:grid-cols-2"
        >
          <label className="text-xs">
            <span className="mono-label">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="mono-label">Severity</span>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="mono-label">Locality</span>
            <input
              required
              minLength={2}
              value={form.locality}
              onChange={(e) => setForm({ ...form, locality: e.target.value })}
              placeholder="e.g. Magarpatta Road"
              className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="mono-label">Description</span>
            <textarea
              required
              minLength={5}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What did you observe?"
              className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? "Submitting…" : "Submit complaint"}
            </button>
            {mutation.isError && (
              <span className="text-xs" style={{ color: "var(--risk-severe)" }}>
                {(mutation.error as Error).message}
              </span>
            )}
          </div>
        </form>
      )}

      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {isLoading && <p className="text-sm text-muted-foreground">Loading complaints…</p>}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No complaints logged for this filter.</p>
        )}
        {rows.map((c) => (
          <div
            key={c.id}
            className="rounded-md border border-border bg-surface-raised/60 p-3"
            style={{ borderLeft: `3px solid ${severityColor(c.severity)}` }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">
                {CATEGORY_LABEL[c.category] ?? c.category} · {c.locality}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {STATUS_LABEL[c.status]} · {SOURCE_LABEL[c.source]}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Reported {new Date(c.reported_at).toLocaleDateString("en-IN")}
              {c.resolved_at
                ? ` · resolved ${new Date(c.resolved_at).toLocaleDateString("en-IN")}`
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
