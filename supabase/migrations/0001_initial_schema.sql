-- ─────────────────────────────────────────────────────────────────────────────
-- Bridge Up — Initial Schema Migration
-- Run via: supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Custom ENUMs ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('student', 'recruiter', 'university');
CREATE TYPE language_preference AS ENUM ('en', 'fr', 'ar');
CREATE TYPE verification_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned', 'deleted');
CREATE TYPE opportunity_type AS ENUM ('internship', 'part_time', 'remote', 'job', 'freelance_project');
CREATE TYPE opportunity_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE application_status AS ENUM (
  'applied', 'withdrawn', 'accepted', 'rejected',
  'auto_closed', 'cancelled_student', 'cancelled_mid', 'completed'
);
CREATE TYPE contract_status AS ENUM ('pending', 'active', 'completed', 'partial', 'cancelled');
CREATE TYPE completion_type AS ENUM ('full', 'partial', 'freelance');
CREATE TYPE certificate_type AS ENUM ('internship', 'freelance');
CREATE TYPE chat_room_type AS ENUM ('student_recruiter', 'student_student', 'university_student');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email');
CREATE TYPE identity_verification_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE TABLE public.users (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                 user_role NOT NULL DEFAULT 'student',
  is_enrolled          BOOLEAN NOT NULL DEFAULT FALSE,
  freelance_mode       BOOLEAN NOT NULL DEFAULT FALSE,
  is_student           BOOLEAN NOT NULL DEFAULT TRUE,
  current_level        INT NOT NULL DEFAULT 1,
  total_xp             INT NOT NULL DEFAULT 0,
  language_preference  language_preference NOT NULL DEFAULT 'en',
  verification_status  verification_status NOT NULL DEFAULT 'not_submitted',
  account_status       account_status NOT NULL DEFAULT 'active',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ── student_profiles ──────────────────────────────────────────────────────────

CREATE TABLE public.student_profiles (
  user_id         UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  bio             TEXT CHECK (char_length(bio) <= 300),
  photo_url       TEXT,
  cv_url          TEXT,
  cv_public       BOOLEAN NOT NULL DEFAULT FALSE,
  university_id   UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  field_of_study  TEXT,
  academic_year   TEXT,
  degree          TEXT,
  social_links    JSONB
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- ── companies ─────────────────────────────────────────────────────────────────

CREATE TABLE public.companies (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  industry  TEXT,
  city      TEXT,
  size      TEXT,
  website   TEXT,
  logo_url  TEXT,
  about     TEXT,
  owner_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ── recruiter_profiles ────────────────────────────────────────────────────────

CREATE TABLE public.recruiter_profiles (
  user_id    UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  job_title  TEXT,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT
);

ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- ── recruiter_team_members ────────────────────────────────────────────────────

CREATE TABLE public.recruiter_team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{}',
  invited_by  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  UNIQUE (company_id, user_id)
);

ALTER TABLE public.recruiter_team_members ENABLE ROW LEVEL SECURITY;

-- ── universities ──────────────────────────────────────────────────────────────

CREATE TABLE public.universities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT,
  claimed     BOOLEAN NOT NULL DEFAULT FALSE,
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- ── university_profiles ───────────────────────────────────────────────────────

CREATE TABLE public.university_profiles (
  user_id        UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  university_id  UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE
);

ALTER TABLE public.university_profiles ENABLE ROW LEVEL SECURITY;

-- ── opportunities ─────────────────────────────────────────────────────────────

CREATE TABLE public.opportunities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  company_id       UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  title            TEXT NOT NULL,
  type             opportunity_type NOT NULL,
  field            TEXT,
  duration_days    INT,
  location         TEXT,
  description      TEXT NOT NULL,
  required_skills  TEXT[] NOT NULL DEFAULT '{}',
  xp_reward        INT NOT NULL DEFAULT 0,
  deadline         DATE NOT NULL,
  status           opportunity_status NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Full-text search generated column
  fts              TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(field, '') || ' ' || coalesce(location, ''))
  ) STORED
);

CREATE INDEX opportunities_fts_idx ON public.opportunities USING GIN (fts);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- ── applications ──────────────────────────────────────────────────────────────

CREATE TABLE public.applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE RESTRICT,
  student_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status           application_status NOT NULL DEFAULT 'applied',
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (opportunity_id, student_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ── contracts ─────────────────────────────────────────────────────────────────

CREATE TABLE public.contracts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id       UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
  student_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  recruiter_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  signed_by_student    BOOLEAN NOT NULL DEFAULT FALSE,
  signed_by_recruiter  BOOLEAN NOT NULL DEFAULT FALSE,
  student_signed_at    TIMESTAMPTZ,
  recruiter_signed_at  TIMESTAMPTZ,
  student_ip           TEXT,
  recruiter_ip         TEXT,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  status               contract_status NOT NULL DEFAULT 'pending',
  pdf_url              TEXT
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- ── completions ───────────────────────────────────────────────────────────────

CREATE TABLE public.completions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id     UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
  requested_by       UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  confirmed_at       TIMESTAMPTZ,
  type               completion_type NOT NULL,
  flagged_for_audit  BOOLEAN NOT NULL DEFAULT FALSE,
  auto_confirmed     BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

-- ── certificates ──────────────────────────────────────────────────────────────

CREATE TABLE public.certificates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  opportunity_id   UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE RESTRICT,
  application_id   UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
  public_url       TEXT NOT NULL UNIQUE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type             certificate_type NOT NULL
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ── xp_events ────────────────────────────────────────────────────────────────

CREATE TABLE public.xp_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action       TEXT NOT NULL,
  xp_awarded   INT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference_id UUID
);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- ── reviews ───────────────────────────────────────────────────────────────────

CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reviewee_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  flagged         BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ── notifications ─────────────────────────────────────────────────────────────

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel     notification_channel NOT NULL DEFAULT 'in_app'
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── chat_rooms ────────────────────────────────────────────────────────────────

CREATE TABLE public.chat_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        chat_room_type NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- ── chat_participants ─────────────────────────────────────────────────────────

CREATE TABLE public.chat_participants (
  room_id  UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- ── chat_messages ─────────────────────────────────────────────────────────────

CREATE TABLE public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  body        TEXT NOT NULL,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ── follows ───────────────────────────────────────────────────────────────────

CREATE TABLE public.follows (
  follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followee_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ── identity_verifications ────────────────────────────────────────────────────

CREATE TABLE public.identity_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_url  TEXT NOT NULL,
  status        identity_verification_status NOT NULL DEFAULT 'not_submitted',
  reviewed_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  notes         TEXT
);

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- ── audit_logs ────────────────────────────────────────────────────────────────

CREATE TABLE public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- XP Level Trigger
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.total_xp IS DISTINCT FROM OLD.total_xp THEN
    NEW.current_level := CASE
      WHEN NEW.total_xp >= 2501 THEN 5
      WHEN NEW.total_xp >= 1201 THEN 4
      WHEN NEW.total_xp >= 601  THEN 3
      WHEN NEW.total_xp >= 201  THEN 2
      ELSE 1
    END;
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_user_level
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_user_level();

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at auto-refresh trigger (reusable)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();