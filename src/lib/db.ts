import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Domain row types (mirrors the database schema).
export type Supplier = {
  id: string;
  ref_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  supplier_type: string | null;
  product_categories: string | null;
  capabilities_claimed: string | null;
  fill_type: string | null;
  certifications: string | null;
  key_equipment: string | null;
  moq: string | null;
  region: string | null;
  in_database: boolean | null;
  form_filled: boolean | null;
  last_contacted: string | null;
  last_response: string | null;
  can_do: string | null;
  cannot_do: string | null;
  created_at: string;
  updated_at: string;
};

export type Partner = {
  id: string;
  ref_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  supplier_type: string | null;
  product_categories: string | null;
  capabilities: string | null;
  fill_type: string | null;
  certifications: string | null;
  key_equipment: string | null;
  moq: string | null;
  monthly_capacity: string | null;
  region: string | null;
  referral_commission: string | null;
  nda_signed: string | null;
  agreement_date: string | null;
  relationship_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FormSubmission = {
  id: string;
  submission_date: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  supplier_type: string | null;
  products_made: string | null;
  equipment: string | null;
  certifications: string | null;
  fill_type: string | null;
  moq: string | null;
  monthly_capacity: string | null;
  region: string | null;
  open_to_commission: string | null;
  notes: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  user_id: string;
  order_id: string | null;
  brand: string;
  contact: string | null;
  product: string | null;
  category: string | null;
  volume: string | null;
  packaging: string | null;
  technical_requirements: string | null;
  certifications_needed: string | null;
  target_launch: string | null;
  budget_notes: string | null;
  competitor_reference: string | null;
  plan: string;
  upgraded: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CampaignSupplier = {
  id: string;
  user_id: string;
  campaign_id: string;
  supplier_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  match_score: number | null;
  match_reasons: string | null;
  source: string;
  stage: string;
  response: string | null;
  commission_status: string | null;
  is_partner: boolean | null;
  escalated: boolean;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  user_id: string;
  campaign_supplier_id: string;
  direction: string;
  subject: string | null;
  body: string;
  classification: string | null;
  created_at: string;
};

export type Escalation = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  campaign_supplier_id: string | null;
  reason: string;
  context: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  updated_at: string;
};

// A loosely-typed client. The generated types file does not include our tables,
// so we use the untyped client to interact with them.
export const db = supabase as unknown as SupabaseClient;

export const PIPELINE_STAGES = [
  "IDENTIFIED",
  "CONTACTED",
  "RESPONDED",
  "QUALIFIED",
  "NEGOTIATING",
  "FINALIZED",
  "REJECTED",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
