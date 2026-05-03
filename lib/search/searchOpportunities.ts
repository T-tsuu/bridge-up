import { createClient } from "@/lib/supabase/server";
import type {
  OpportunitySearchFilters,
  OpportunitySearchResult,
  OpportunityType,
} from "@/types";

/**
 * Central opportunity search function.
 * ALL opportunity search queries in the codebase must go through this function.
 * Do not write inline Supabase queries for opportunities in components or route handlers.
 */
export async function searchOpportunities(
  query: string,
  filters: OpportunitySearchFilters = {}
): Promise<OpportunitySearchResult[]> {
  const supabase = await createClient();

  let builder = supabase
    .from("opportunities")
    .select(
      `
      *,
      companies ( name ),
      recruiter_profiles ( full_name )
    `
    )
    .eq("status", "active");

  // ── Full-Text Search ───────────────────────────────────────────────────────
  if (query.trim().length > 0) {
    // Uses PostgreSQL tsvector FTS. Requires a generated column or index on
    // to_tsvector('english', title || ' ' || description) — add in migration.
    builder = builder.textSearch("fts", query, {
      type: "websearch",
      config: "english",
    });
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  if (filters.field) {
    builder = builder.ilike("field", `%${filters.field}%`);
  }

  if (filters.type) {
    builder = builder.eq("type", filters.type as OpportunityType);
  }

  if (filters.location) {
    builder = builder.ilike("location", `%${filters.location}%`);
  }

  if (filters.duration !== undefined) {
    builder = builder.lte("duration_days", filters.duration);
  }

  if (filters.xp_tier) {
    const XP_TIERS = {
      low:    { gte: 0,   lte: 100 },
      medium: { gte: 101, lte: 300 },
      high:   { gte: 301, lte: 99999 },
    };
    const tier = XP_TIERS[filters.xp_tier];
    builder = builder
      .gte("xp_reward", tier.gte)
      .lte("xp_reward", tier.lte);
  }

  // ── Ordering ───────────────────────────────────────────────────────────────
  builder = builder.order("created_at", { ascending: false });

  const { data, error } = await builder;

  if (error) {
    throw new Error(`Opportunity search failed: ${error.message}`);
  }

  // Flatten joined fields into a flat result shape
  return (data ?? []).map((row: any) => ({
    ...row,
    company_name: row.companies?.name ?? null,
    recruiter_name: row.recruiter_profiles?.full_name ?? null,
    companies: undefined,
    recruiter_profiles: undefined,
  })) as OpportunitySearchResult[];
}