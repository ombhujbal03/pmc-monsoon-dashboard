import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getLiveWeather } from "@/lib/weather.functions";
import { fetchLiveWeatherBundleClient } from "@/lib/weather";
import { fetchWards, toFrontendWard } from "@/lib/api";
import { WARDS as FALLBACK_WARDS, predict, type WardId } from "@/lib/prediction";
import { CATEGORY_LABEL, createFeedback, fetchComplaints } from "@/lib/civic";
import type { Session } from "@/lib/session";

/**
 * Tactical view: geographic pins + checklists only. Risk percentages, trends
 * and probability charts are deliberately hidden to avoid data fatigue.
 */
export default function FieldOps({ session }: { session: Session }) {
  const [wardId, setWardId] = useState<WardId>("hadapsar");

  const wardsQuery = useQuery({
    queryKey: ["wards"],
    queryFn: fetchWards,
    staleTime: 60 * 1000,
  });
  const apiWards = wardsQuery.data?.wards;
  const wardList = useMemo(
    () => (apiWards && apiWards.length > 0 ? apiWards.map(toFrontendWard) : FALLBACK_WARDS),
    [apiWards],
  );
  const ward = useMemo(
    () => wardList.find((w) => w.id === wardId) || wardList[0] || FALLBACK_WARDS[0]!,
    [wardList, wardId],
  );
  const qc = useQueryClient();

  const weatherQuery = useQuery({
    queryKey: ["live-weather"],
    queryFn: async () => {
      try {
        const data = await getLiveWeather();
        if (data && data.wards && Object.keys(data.wards).length > 0) return data;
      } catch (e) {
        console.warn("[FieldOps] Server weather error:", e);
      }
      return fetchLiveWeatherBundleClient(FALLBACK_WARDS);
    },
    staleTime: 15 * 60 * 1000,
    retry: 2,
  });
  const wardWeather = weatherQuery.data?.wards[wardId] ?? null;
  const prediction = useMemo(() => predict(ward, 10, wardWeather), [ward, wardWeather]);

  const complaintsQuery = useQuery({
    queryKey: ["complaints", wardId],
    queryFn: () => fetchComplaints(wardId),
  });
  const openComplaints = (complaintsQuery.data ?? []).filter((c) => c.status !== "resolved");

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [cases, setCases] = useState(0);
  const [verified, setVerified] = useState(true);

  const submit = useMutation({
    mutationFn: () =>
      createFeedback({
        ward_id: wardId,
        officer_name: session.label,
        designation: "Field Crew",
        message: note.trim() || "Dispatch tasks completed on ground.",
        risk_verified: verified,
        observed_cases: cases,
      }),
    onSuccess: () => {
      setNote("");
      setCases(0);
      qc.invalidateQueries({ queryKey: ["feedback", wardId] });
    },
  });

  const tasks = prediction.diseases.slice(0, 3).map((d, i) => ({
    id: `${wardId}-${i}`,
    order: d.action,
    due: Math.max(2, Math.round((i + 1) * 1.5)),
  }));

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <div>
        <div className="mono-label mb-2">Assigned ward</div>
        <select
          value={wardId}
          onChange={(e) => setWardId(e.target.value as WardId)}
          className="w-full rounded-md border border-input bg-secondary px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
        >
          {wardList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="panel p-5">
        <div className="mono-label mb-3">Dispatch orders — {ward.short}</div>
        <ul className="space-y-3">
          {tasks.map((t, i) => (
            <li key={t.id} className="flex items-start gap-3 rounded-md bg-secondary/60 p-3">
              <input
                type="checkbox"
                checked={!!done[t.id]}
                onChange={(e) => setDone((d) => ({ ...d, [t.id]: e.target.checked }))}
                className="mt-1 h-5 w-5 accent-[var(--primary)]"
              />
              <div>
                <p className="text-sm font-semibold">
                  DISPATCH {i + 1}: {ward.areas[i % ward.areas.length]} — {t.order}
                </p>
                <p className="text-xs text-muted-foreground">Complete by Day {t.due}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel p-5">
        <div className="mono-label mb-3">Location pins — open grievances</div>
        {complaintsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading grievances…</p>
        ) : openComplaints.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open grievances for this ward.</p>
        ) : (
          <ul className="space-y-2">
            {openComplaints.map((c) => (
              <li key={c.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-semibold">
                  📍 {c.locality} · {CATEGORY_LABEL[c.category] ?? c.category}
                </p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <a
                  className="mt-1 inline-block text-xs underline"
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${c.locality}, Pune`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Navigate
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel p-5">
        <div className="mono-label mb-3">Close the loop — verify outbreak / task complete</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ground observation (choked nullah cleared, breeding sites found…)"
          className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Outbreak risk verified on ground
          </label>
          <label className="flex items-center gap-2 text-sm">
            Observed cases
            <input
              type="number"
              min={0}
              max={999}
              value={cases}
              onChange={(e) => setCases(Math.max(0, Math.min(999, Number(e.target.value))))}
              className="w-20 rounded-md border border-input bg-secondary px-2 py-1 text-sm"
            />
          </label>
        </div>
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending}
          className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submit.isPending ? "Submitting…" : "Submit task completion"}
        </button>
        {submit.isSuccess && (
          <p className="mt-2 text-xs" style={{ color: "var(--risk-low)" }}>
            Report filed — model feedback loop updated.
          </p>
        )}
        {submit.isError && (
          <p className="mt-2 text-xs" style={{ color: "var(--risk-severe)" }}>
            Could not submit. Check your connection and retry.
          </p>
        )}
      </div>
    </main>
  );
}
