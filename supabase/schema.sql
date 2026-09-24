-- ============================================================================
-- LIFEOPS AI — PRODUCTION DATABASE SCHEMA v2
-- PostgreSQL + Supabase Row Level Security (RLS)
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL, -- References auth.users(id)
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  date_of_birth DATE,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  account_status TEXT DEFAULT 'ACTIVE',
  preferences JSONB DEFAULT '{"language": "English (US)", "notificationsEnabled": true, "sensitivityLevel": "standard"}'::jsonb
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 2. DOCUMENTS & FIELDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'verified',
  issuer TEXT,
  expiry_date DATE,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence NUMERIC(5,2) DEFAULT 0.95,
  verified BOOLEAN DEFAULT TRUE,
  sensitive BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'identity'
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own document fields" ON public.document_fields FOR ALL USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 3. PRIVACY & CONSENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.privacy_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  data_minimization_enabled BOOLEAN DEFAULT TRUE,
  mask_sensitive_fields BOOLEAN DEFAULT TRUE,
  allow_external_sharing BOOLEAN DEFAULT FALSE,
  consent_approved BOOLEAN DEFAULT TRUE,
  consent_approved_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own privacy consents" ON public.privacy_consents FOR ALL USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 4. OPPORTUNITIES & CRITERIA (ADMIN / PUBLIC READ)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  deadline DATE,
  authority TEXT NOT NULL,
  description TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opportunity_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  rule_key TEXT NOT NULL,
  label TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- age_range, max_number, min_number, exact_match
  target_value JSONB NOT NULL
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (TRUE);
CREATE POLICY "Public read opportunity rules" ON public.opportunity_rules FOR SELECT USING (TRUE);


-- ----------------------------------------------------------------------------
-- 5. APPLICATIONS, FIELDS & APPROVALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id),
  opportunity_title TEXT NOT NULL,
  category TEXT NOT NULL,
  authority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, READY_FOR_REVIEW, APPROVED, SUBMITTED
  prepared_at TIMESTAMPTZ DEFAULT NOW(),
  user_declaration_approved BOOLEAN DEFAULT FALSE,
  user_declaration_signed_at TIMESTAMPTZ,
  reference_id TEXT,
  submitted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.application_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  source_document TEXT NOT NULL,
  verification_status TEXT DEFAULT 'VERIFIED',
  approved BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  rejection_reason TEXT,
  sensitive BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own applications" ON public.applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own application fields" ON public.application_fields FOR ALL USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 6. CRYPTOGRAPHIC AUDIT TRAIL LEDGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_label TEXT NOT NULL,
  details TEXT NOT NULL,
  application_title TEXT,
  field_key TEXT,
  source_document TEXT,
  approved_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  previous_hash TEXT NOT NULL,
  current_hash TEXT NOT NULL
);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit ledger" ON public.audit_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can append own audit events" ON public.audit_events FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO', -- SUCCESS, ERROR, WARNING, INFO
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  link_tab TEXT
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE USER ISOLATION
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_fields_user ON public.document_fields(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id);
