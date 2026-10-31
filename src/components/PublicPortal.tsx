import { useMutation, useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import { getLiveWeather } from "@/lib/weather.functions";
import { fetchLiveWeatherBundleClient } from "@/lib/weather";
import { fetchWards, toFrontendWard } from "@/lib/api";
import { WARDS, riskLevelOf, type RiskLevel, type WardId } from "@/lib/prediction";
import { createComplaint } from "@/lib/civic";
import type { Session } from "@/lib/session";

const PuneMap = lazy(() => import("@/components/PuneMap"));

const TIER: Record<RiskLevel, { label: string; color: string; advisory: string }> = {
  low: {
    label: "Green — Normal",
    color: "var(--risk-low)",
    advisory:
      "WARD ADVISORY: Normal monsoon conditions. Keep water containers covered and report any waterlogging you see.",
  },
  moderate: {
    label: "Yellow — Moderate",
    color: "var(--risk-moderate)",
    advisory:
      "WARD ADVISORY: Moderate monsoon risk. Empty stagnant water containers to prevent mosquito breeding. Boil drinking water.",
  },
  high: {
    label: "Orange — Elevated",
    color: "var(--risk-high)",
    advisory:
      "WARD ADVISORY: Elevated monsoon risk. Use mosquito nets and repellents, boil drinking water, and avoid walking through flooded streets.",
  },
  severe: {
    label: "Red — High Caution",
    color: "var(--risk-severe)",
    advisory:
      "WARD ADVISORY: High caution. Avoid contact with floodwater, drink only boiled or bottled water, use mosquito protection, and seek care early for fever.",
  },
};

export default function PublicPortal({
  session,
  onRequestVerify,
}: {
  session: Session | null;
  onRequestVerify: () => void;
}) {
  const [wardId, setWardId] = useState<WardId>("hadapsar");
  const [pincode, setPincode] = useState("");

  const wardsQuery = useQuery({
    queryKey: ["wards"],
    queryFn: fetchWards,
    staleTime: 60 * 1000,
  });
  const apiWards = wardsQuery.data?.wards;
  const wardList = useMemo(
    () => (apiWards && apiWards.length > 0 ? apiWards.map(toFrontendWard) : WARDS),
    [apiWards],
  );
  const ward = useMemo(
    () => wardList.find((w) => w.id === wardId) || wardList[0] || WARDS[0]!,
    [wardList, wardId],
  );

  const weatherQuery = useQuery({
    queryKey: ["live-weather"],
    queryFn: async () => {
      try {
        const data = await getLiveWeather();
        if (data && data.wards && Object.keys(data.wards).length > 0) return data;
      } catch (e) {
        console.warn("[PublicPortal] Server weather error:", e);
      }
      return fetchLiveWeatherBundleClient(WARDS);
    },
    staleTime: 15 * 60 * 1000,
    retry: 2,
  });
  const weather = weatherQuery.data;
  const level = useMemo(
    () => riskLevelOf(ward, 10, weather?.wards[wardId] ?? null),
    [ward, weather, wardId],
  );
  const tier = TIER[level];

  const searchPincode = (value: string) => {
    setPincode(value);
    const hit = wardList.find((w) => w.pincodes.some((p) => String(p) === value));
    if (hit) setWardId(hit.id);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
      <div className="panel p-5">
        <div className="mono-label mb-2">Find your area</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={pincode}
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter pincode e.g. 411028"
            onChange={(e) => searchPincode(e.target.value.replace(/\D/g, ""))}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value as WardId)}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {WARDS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="panel p-5"
        style={{ borderColor: tier.color, boxShadow: `0 0 0 1px ${tier.color}` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-background"
            style={{ backgroundColor: tier.color }}
          >
            {tier.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {ward.short} · pincodes {ward.pincodes.join(", ")}
          </span>
        </div>
        <p className="mt-3 text-base font-semibold leading-snug">{tier.advisory}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Safety tier only. Detailed outbreak probabilities and infrastructure records are reserved
          for municipal officers.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="panel flex h-[420px] items-center justify-center p-4 text-sm text-muted-foreground">
            Loading advisory map…
          </div>
        }
      >
        <PuneMap
          wards={wardList}
          selected={wardId}
          onSelect={setWardId}
          horizon={10}
          weather={weather}
          showRisk
          showComplaints={false}
        />
      </Suspense>

      <ReportForm wardId={wardId} session={session} onRequestVerify={onRequestVerify} />
    </main>
  );
}

function ReportForm({
  wardId,
  session,
  onRequestVerify,
}: {
  wardId: WardId;
  session: Session | null;
  onRequestVerify: () => void;
}) {
  const [locality, setLocality] = useState("");
  const [description, setDescription] = useState("");
  const verified = session?.role === "citizen";

  const submit = useMutation({
    mutationFn: () =>
      createComplaint({
        ward_id: wardId,
        category: "water_stagnation",
        locality: locality.trim().slice(0, 120),
        description: description.trim().slice(0, 500),
        severity: "medium",
      }),
    onSuccess: () => {
      setLocality("");
      setDescription("");
    },
  });

  return (
    <div className="panel p-5">
      <div className="mono-label mb-3">Report waterlogging</div>
      {!verified ? (
        <>
          <p className="text-sm text-muted-foreground">
            Verify your mobile number with an OTP to file a grievance. This keeps fake reports out of
            the municipal queue.
          </p>
          <button
            onClick={onRequestVerify}
            className="mt-3 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Verify mobile & report
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            maxLength={120}
            placeholder="Street / locality"
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="What is happening? e.g. knee-deep water near the bus stop for 3 days"
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || locality.trim().length < 3 || description.trim().length < 5}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submit.isPending ? "Submitting…" : "Submit grievance"}
          </button>
          {submit.isSuccess && (
            <p className="text-xs" style={{ color: "var(--risk-low)" }}>
              Grievance registered with the ward office. Thank you.
            </p>
          )}
          {submit.isError && (
            <p className="text-xs" style={{ color: "var(--risk-severe)" }}>
              Could not submit right now — please retry.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
