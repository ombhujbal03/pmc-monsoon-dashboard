import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchWards,
  fetchWardWeather,
  updateWardMetrics,
  toFrontendWard,
  type ApiWard,
} from "@/lib/api";
import {
  LEVEL_LABEL,
  WARDS as FALLBACK_WARDS,
  predict,
  type Horizon,
  type Prediction,
  type Ward,
  type WardId,
} from "@/lib/prediction";

const PuneMap = lazy(() => import("@/components/PuneMap"));
const ComplaintsSection = lazy(() => import("@/components/ComplaintsSection"));
const OfficerFeedbackSection = lazy(() => import("@/components/OfficerFeedbackSection"));

const levelVar = (level: string) =>
  level === "severe"
    ? "var(--risk-severe)"
    : level === "high"
      ? "var(--risk-high)"
      : level === "moderate"
        ? "var(--risk-moderate)"
        : "var(--risk-low)";

export default function CommandCenter() {
  const [wardId, setWardId] = useState<WardId>("hadapsar");
  const [horizon, setHorizon] = useState<Horizon>(10);
  const [running, setRunning] = useState(false);
  const [showRisk, setShowRisk] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [drainInput, setDrainInput] = useState<number>(0);
  const [sewageInput, setSewageInput] = useState<number>(0);
  const [stagnationInput, setStagnationInput] = useState<number>(0);

  const queryClient = useQueryClient();

  // 1. Fetch wards from custom backend API
  const wardsQuery = useQuery({
    queryKey: ["wards"],
    queryFn: fetchWards,
    staleTime: 60 * 1000,
  });

  const apiWards = wardsQuery.data?.wards;
  const isBackendLive = wardsQuery.data?.isBackendLive ?? false;

  // Memoize wardList so reference remains stable across renders
  const wardList: Ward[] = useMemo(() => {
    return apiWards && apiWards.length > 0 ? apiWards.map(toFrontendWard) : FALLBACK_WARDS;
  }, [apiWards]);

  // Memoize selected ward
  const ward = useMemo(() => {
    return wardList.find((w) => w.id === wardId) || wardList[0] || FALLBACK_WARDS[0]!;
  }, [wardList, wardId]);

  // 2. Fetch live weather for selected ward from backend API
  const wardWeatherQuery = useQuery({
    queryKey: ["ward-weather", wardId],
    queryFn: () => fetchWardWeather(wardId),
    staleTime: 5 * 60 * 1000,
  });

  const weatherData = wardWeatherQuery.data;
  const isWeatherLive = weatherData?.is_live ?? false;

  const liveDays = useMemo(() => {
    return (weatherData?.daily || []).slice(0, horizon);
  }, [weatherData?.daily, horizon]);

  const hasLive = isWeatherLive && liveDays.length > 0;

  const liveRain = useMemo(() => {
    return hasLive
      ? Math.round(liveDays.reduce((s: number, d: any) => s + (d.rainMm || 0), 0) * 10) / 10
      : null;
  }, [hasLive, liveDays]);

  const liveHumidity = useMemo(() => {
    return hasLive
      ? Math.round(liveDays.reduce((s: number, d: any) => s + (d.humidity || 0), 0) / (liveDays.length || 1))
      : null;
  }, [hasLive, liveDays]);

  const liveTemp = useMemo(() => {
    return hasLive
      ? Math.round((liveDays.reduce((s: any, d: any) => s + (d.tempC || 0), 0) / (liveDays.length || 1)) * 10) / 10
      : null;
  }, [hasLive, liveDays]);

  const wardWeather = useMemo(() => {
    return hasLive
      ? {
          wardId,
          fetchedAt: weatherData?.updated_at || new Date().toISOString(),
          daily: liveDays,
        }
      : null;
  }, [hasLive, wardId, weatherData?.updated_at, liveDays]);

  const mapWeather = useMemo(() => {
    return wardWeather
      ? {
          fetchedAt: wardWeather.fetchedAt,
          wards: { [wardId]: wardWeather },
        }
      : undefined;
  }, [wardWeather, wardId]);

  // Pure derived prediction — zero state setters, zero render loops!
  const prediction = useMemo(() => {
    return predict(ward, horizon, wardWeather);
  }, [ward, horizon, wardWeather]);

  // Sync edit form inputs ONLY when selected ward ID or metrics change
  useEffect(() => {
    setDrainInput(ward.drainComplaints);
    setSewageInput(ward.sewageComplaints);
    setStagnationInput(ward.stagnationDays);
  }, [ward.id, ward.drainComplaints, ward.sewageComplaints, ward.stagnationDays]);

  // 3. Mutation for updating civic metrics via POST /api/wards/:id/metrics
  const updateMetricsMutation = useMutation({
    mutationFn: (updated: {
      drain_complaints: number;
      sewage_overflow: number;
      water_stagnation_days: number;
    }) => updateWardMetrics(wardId, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      setEditingMetrics(false);
    },
  });

  const run = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
    }, 250);
  }, []);

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetricsMutation.mutate({
      drain_complaints: drainInput,
      sewage_overflow: sewageInput,
      water_stagnation_days: stagnationInput,
    });
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
      <aside className="panel h-fit space-y-5 p-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="mono-label">Select PMC ward office</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                isBackendLive ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
              }`}
            >
              {isBackendLive ? "SQLite API Connected" : "Local Baseline"}
            </span>
          </div>
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value as WardId)}
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {wardList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mono-label mb-2">Forecast window — {horizon} days</div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>T+1</span>
            <span>T+10</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="mono-label">Map layers</div>
          <Toggle label="Risk heat layer" checked={showRisk} onChange={setShowRisk} />
          <Toggle label="Complaint markers" checked={showComplaints} onChange={setShowComplaints} />
        </div>

        <button
          onClick={run}
          disabled={running}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {running ? "Running model…" : "Predict Outbreak Risk"}
        </button>

        {/* Ward Profile & Dynamic Live Weather Info */}
        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="mono-label">Ward profile {hasLive ? "· live forecast" : "· baseline"}</span>
            <button
              onClick={() => setEditingMetrics(!editingMetrics)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {editingMetrics ? "Cancel edit" : "Edit metrics"}
            </button>
          </div>

          {editingMetrics ? (
            <form onSubmit={handleSaveMetrics} className="space-y-2.5 bg-secondary/50 p-2.5 rounded-md border border-border">
              <div className="text-xs font-semibold text-foreground">Update Ward Civic Metrics</div>
              <div>
                <label className="text-[11px] text-muted-foreground">Drain Complaints</label>
                <input
                  type="number"
                  min={0}
                  value={drainInput}
                  onChange={(e) => setDrainInput(Number(e.target.value))}
                  className="w-full rounded bg-background px-2 py-1 text-xs border border-input"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Sewage Overflow Reports</label>
                <input
                  type="number"
                  min={0}
                  value={sewageInput}
                  onChange={(e) => setSewageInput(Number(e.target.value))}
                  className="w-full rounded bg-background px-2 py-1 text-xs border border-input"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Stagnation Days</label>
                <input
                  type="number"
                  min={0}
                  value={stagnationInput}
                  onChange={(e) => setStagnationInput(Number(e.target.value))}
                  className="w-full rounded bg-background px-2 py-1 text-xs border border-input"
                />
              </div>
              <button
                type="submit"
                disabled={updateMetricsMutation.isPending}
                className="w-full mt-1 rounded bg-primary py-1 text-xs font-medium text-primary-foreground"
              >
                {updateMetricsMutation.isPending ? "Updating API…" : "Save to SQLite"}
              </button>
            </form>
          ) : (
            <>
              <Row label="Pincodes" value={ward.pincodes.join(", ")} />
              <Row label="Areas" value={ward.areas.join(", ")} />
              <Row
                label={`Rainfall (${horizon}d)`}
                value={liveRain !== null ? `${liveRain} mm` : `${ward.rainfallMm} mm (baseline)`}
              />
              <Row label="Humidity" value={`${liveHumidity ?? ward.humidity}%`} />
              <Row label="Temperature" value={`${liveTemp ?? ward.tempC}°C`} />
              <Row label="Drain complaints" value={String(ward.drainComplaints)} />
              <Row label="Sewage overflow" value={String(ward.sewageComplaints)} />
              <Row label="Water stagnation" value={`${ward.stagnationDays} days`} />
              <Row label="Dengue cases (last season)" value={String(ward.historicalDengue)} />
              <Row label="Population" value={ward.population.toLocaleString("en-IN")} />
            </>
          )}

          {/* Real-time Weather Status Indicator as requested */}
          <div className="pt-2 border-t border-border/50 text-xs">
            {wardWeatherQuery.isLoading ? (
              <p className="text-muted-foreground animate-pulse">
                Fetching real-time weather from API for {ward.short}…
              </p>
            ) : hasLive ? (
              <div className="space-y-0.5">
                <p className="text-emerald-500 font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live weather updated {weatherData?.updated_at ? new Date(weatherData.updated_at).toLocaleTimeString("en-IN") : "Just now"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Condition: {weatherData?.condition} · Rain chance: {weatherData?.rain_chance}%
                </p>
              </div>
            ) : (
              <p className="text-amber-500/90 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Live weather unavailable — using stored seasonal baseline.
              </p>
            )}
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Coordinates:</span>
              <span>
                {ward.lat.toFixed(4)}, {ward.lon.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        {prediction && (
          <div
            className="panel p-5"
            style={{
              borderColor: levelVar(prediction.level),
              boxShadow: `0 0 0 1px ${levelVar(prediction.level)}, 0 18px 40px -28px ${levelVar(prediction.level)}`,
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-background"
                style={{ backgroundColor: levelVar(prediction.level) }}
              >
                {LEVEL_LABEL[prediction.level].toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {prediction.ward.name} · T+1 to T+{prediction.horizon}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold leading-snug">{prediction.headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Water profile detected: {prediction.waterProfile}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {`${LEVEL_LABEL[prediction.level].toUpperCase()}: ${prediction.diseases[0]!.probability}% ${prediction.diseases[0]!.disease} probability in ${prediction.ward.short} at T+${prediction.horizon}. Primary driver: ${prediction.features[0]!.weight}% weight on ${prediction.features[0]!.feature.toLowerCase()}.`}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            label={hasLive ? "Forecast rainfall (live)" : "Expected rainfall"}
            value={`${liveRain ?? Math.round((ward.rainfallMm * horizon) / 14)} mm`}
          />
          <Metric
            label="Unresolved complaints"
            value={String(ward.drainComplaints + ward.sewageComplaints)}
          />
          <Metric
            label="Top risk"
            value={
              prediction ? `${prediction.diseases[0]!.disease} ${prediction.diseases[0]!.probability}%` : "—"
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Suspense
            fallback={
              <div className="panel flex h-[500px] items-center justify-center p-4 text-sm text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <PuneMap
              wards={wardList}
              selected={wardId}
              onSelect={setWardId}
              horizon={horizon}
              weather={mapWeather}
              showRisk={showRisk}
              showComplaints={showComplaints}
            />
          </Suspense>

          <div className="panel p-5">
            <div className="mono-label mb-4">Disease probability</div>
            {!prediction ? (
              <p className="text-sm text-muted-foreground">
                Select a PMC ward and forecast window, then run the model to see which disease is
                likely to spread and what to clean first.
              </p>
            ) : (
              <div className="space-y-4">
                {prediction.diseases.map((d) => (
                  <div key={d.disease}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold">{d.disease}</span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {d.probability}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${d.probability}%`,
                          backgroundColor:
                            d.probability >= 70
                              ? "var(--risk-severe)"
                              : d.probability >= 50
                                ? "var(--risk-high)"
                                : d.probability >= 30
                                  ? "var(--risk-moderate)"
                                  : "var(--risk-low)",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{d.driver}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {prediction && (
          <>
            <div className="panel p-5">
              <div className="mono-label mb-4">
                Timeline forecast · Outbreak risk vs expected rainfall (T+1 to T+{prediction.horizon})
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={prediction.timeline}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="mm" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderColor: "var(--border)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      yAxisId="left"
                      dataKey="rainfall"
                      name="Rainfall (mm)"
                      fill="var(--primary)"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="risk"
                      name="Outbreak risk (%)"
                      stroke={levelVar(prediction.level)}
                      fill={levelVar(prediction.level)}
                      fillOpacity={0.18}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {prediction.live
                  ? "Daily rainfall from the live weather forecast, plotted against the modelled outbreak probability."
                  : "Live forecast unavailable — showing modelled rainfall distribution."}
              </p>
            </div>

            <div className="panel p-5">
              <div className="mono-label mb-4">
                SHAP-style feature importance — why this warning
              </div>
              <div className="space-y-3">
                {prediction.features.map((f) => (
                  <div key={f.feature}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{f.feature}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {f.value} · {f.weight}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${f.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="mono-label mb-4">Sanitation strike checklist — preventative plan</div>
              <ol className="space-y-3">
                {prediction.diseases.slice(0, 2).map((d, i) => (
                  <li key={d.disease} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{d.action}</p>
                      <p className="text-xs text-muted-foreground">
                        Prevents {d.disease} in {prediction.ward.short} · deploy before day{" "}
                        {Math.max(2, Math.round(prediction.horizon * 0.5))}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        <Suspense
          fallback={
            <div className="panel p-5 text-sm text-muted-foreground">Loading civic records…</div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <ComplaintsSection wardId={wardId} wardName={ward.short} />
            <OfficerFeedbackSection wardId={wardId} wardName={ward.short} />
          </div>
        </Suspense>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="mono-label">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
