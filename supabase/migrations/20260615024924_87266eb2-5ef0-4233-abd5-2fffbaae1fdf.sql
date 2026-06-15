
-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SUPPLIERS (shared pool)
CREATE TABLE public.suppliers (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id TEXT,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  supplier_type TEXT,
  product_categories TEXT,
  capabilities_claimed TEXT,
  fill_type TEXT,
  certifications TEXT,
  key_equipment TEXT,
  moq TEXT,
  region TEXT,
  in_database BOOLEAN DEFAULT true,
  form_filled BOOLEAN DEFAULT false,
  last_contacted DATE,
  last_response TEXT,
  can_do TEXT,
  cannot_do TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PARTNERS (shared)
CREATE TABLE public.partners (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id TEXT,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  supplier_type TEXT,
  product_categories TEXT,
  capabilities TEXT,
  fill_type TEXT,
  certifications TEXT,
  key_equipment TEXT,
  moq TEXT,
  monthly_capacity TEXT,
  region TEXT,
  referral_commission TEXT,
  nda_signed TEXT,
  agreement_date TEXT,
  relationship_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read partners" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write partners ins" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write partners upd" ON public.partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write partners del" ON public.partners FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FORM SUBMISSIONS (shared)
CREATE TABLE public.form_submissions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_date DATE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  supplier_type TEXT,
  products_made TEXT,
  equipment TEXT,
  certifications TEXT,
  fill_type TEXT,
  moq TEXT,
  monthly_capacity TEXT,
  region TEXT,
  open_to_commission TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read forms" ON public.form_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert forms" ON public.form_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update forms" ON public.form_submissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete forms" ON public.form_submissions FOR DELETE TO authenticated USING (true);

-- CAMPAIGNS
CREATE TABLE public.campaigns (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT,
  brand TEXT NOT NULL,
  contact TEXT,
  product TEXT,
  category TEXT,
  volume TEXT,
  packaging TEXT,
  technical_requirements TEXT,
  certifications_needed TEXT,
  target_launch TEXT,
  budget_notes TEXT,
  competitor_reference TEXT,
  plan TEXT NOT NULL DEFAULT 'Free',
  upgraded BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CAMPAIGN SUPPLIERS
CREATE TABLE public.campaign_suppliers (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  match_score INTEGER DEFAULT 0,
  match_reasons TEXT,
  source TEXT NOT NULL DEFAULT 'database',
  stage TEXT NOT NULL DEFAULT 'IDENTIFIED',
  response TEXT,
  commission_status TEXT,
  is_partner BOOLEAN DEFAULT false,
  escalated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_suppliers TO authenticated;
GRANT ALL ON public.campaign_suppliers TO service_role;
ALTER TABLE public.campaign_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaign suppliers" ON public.campaign_suppliers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_cs_updated BEFORE UPDATE ON public.campaign_suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MESSAGES
CREATE TABLE public.messages (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_supplier_id UUID NOT NULL REFERENCES public.campaign_suppliers(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'outbound',
  subject TEXT,
  body TEXT NOT NULL,
  classification TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ESCALATIONS
CREATE TABLE public.escalations (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  campaign_supplier_id UUID REFERENCES public.campaign_suppliers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.escalations TO authenticated;
GRANT ALL ON public.escalations TO service_role;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own escalations" ON public.escalations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_esc_updated BEFORE UPDATE ON public.escalations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
