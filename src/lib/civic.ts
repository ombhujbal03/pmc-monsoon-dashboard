import { supabase } from "@/integrations/supabase/client";

export type Complaint = {
  id: string;
  ward_id: string;
  category: string;
  description: string;
  locality: string;
  severity: string;
  status: string;
  source: string;
  reported_at: string;
  resolved_at: string | null;
};

export type OfficerFeedback = {
  id: string;
  ward_id: string;
  officer_name: string;
  designation: string;
  message: string;
  risk_verified: boolean;
  observed_cases: number;
  created_at: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  drainage: "Drainage",
  sewage_overflow: "Sewage overflow",
  water_stagnation: "Water stagnation",
  garbage: "Garbage",
  water_supply: "Water supply",
};

export const SOURCE_LABEL: Record<string, string> = {
  pmc_open_data: "PMC Open Data",
  citizen_app: "Citizen report",
  field_survey: "Field survey",
};

export const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export async function fetchComplaints(wardId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("ward_id", wardId)
    .order("reported_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Complaint[];
}

export async function fetchComplaintCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("complaints")
    .select("ward_id")
    .neq("status", "resolved");
  if (error) throw new Error(error.message);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.ward_id] = (counts[row.ward_id] ?? 0) + 1;
  return counts;
}

export async function createComplaint(input: {
  ward_id: string;
  category: string;
  locality: string;
  description: string;
  severity: string;
}) {
  const { error } = await supabase.from("complaints").insert({ ...input, source: "citizen_app" });
  if (error) throw new Error(error.message);
}

export async function fetchFeedback(wardId: string): Promise<OfficerFeedback[]> {
  const { data, error } = await supabase
    .from("officer_feedback")
    .select("*")
    .eq("ward_id", wardId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OfficerFeedback[];
}

export async function createFeedback(input: {
  ward_id: string;
  officer_name: string;
  designation: string;
  message: string;
  risk_verified: boolean;
  observed_cases: number;
}) {
  const { error } = await supabase.from("officer_feedback").insert(input);
  if (error) throw new Error(error.message);
}
