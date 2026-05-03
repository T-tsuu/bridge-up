export type Locale = "en" | "fr" | "ar";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "recruiter" | "university";
export type LanguagePreference = "en" | "fr" | "ar";
export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";
export type AccountStatus = "active" | "suspended" | "banned" | "deleted";

export type OpportunityType =
  | "internship"
  | "part_time"
  | "remote"
  | "job"
  | "freelance_project";
export type OpportunityStatus = "active" | "closed" | "draft";

export type ApplicationStatus =
  | "applied"
  | "withdrawn"
  | "accepted"
  | "rejected"
  | "auto_closed"
  | "cancelled_student"
  | "cancelled_mid"
  | "completed";

export type ContractStatus =
  | "pending"
  | "active"
  | "completed"
  | "partial"
  | "cancelled";

export type CompletionType = "full" | "partial" | "freelance";

export type CertificateType = "internship" | "freelance";

export type ChatRoomType =
  | "student_recruiter"
  | "student_student"
  | "university_student";

export type IdentityVerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

export type NotificationChannel = "in_app" | "email";

// ─── Database Row Types ────────────────────────────────────────────────────────

export interface DBUser {
  id: string;
  role: UserRole;
  is_enrolled: boolean;
  freelance_mode: boolean;
  is_student: boolean;
  current_level: number;
  total_xp: number;
  language_preference: LanguagePreference;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface DBStudentProfile {
  user_id: string;
  full_name: string;
  bio: string | null;
  photo_url: string | null;
  cv_url: string | null;
  cv_public: boolean;
  university_id: string | null;
  field_of_study: string | null;
  academic_year: string | null;
  degree: string | null;
  social_links: Record<string, string> | null;
}

export interface DBRecruiterProfile {
  user_id: string;
  full_name: string;
  job_title: string | null;
  company_id: string;
}

export interface DBCompany {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  size: string | null;
  website: string | null;
  logo_url: string | null;
  about: string | null;
  owner_id: string;
}

export interface DBRecruiterTeamMember {
  id: string;
  company_id: string;
  user_id: string;
  permissions: Record<string, boolean>;
  invited_by: string;
}

export interface DBUniversity {
  id: string;
  name: string;
  city: string | null;
  claimed: boolean;
  verified: boolean;
  claimed_by: string | null;
}

export interface DBUniversityProfile {
  user_id: string;
  university_id: string;
}

export interface DBOpportunity {
  id: string;
  recruiter_id: string;
  company_id: string;
  title: string;
  type: OpportunityType;
  field: string | null;
  duration_days: number | null;
  location: string | null;
  description: string;
  required_skills: string[];
  xp_reward: number;
  deadline: string;
  status: OpportunityStatus;
  created_at: string;
}

export interface DBApplication {
  id: string;
  opportunity_id: string;
  student_id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

export interface DBContract {
  id: string;
  application_id: string;
  student_id: string;
  recruiter_id: string;
  signed_by_student: boolean;
  signed_by_recruiter: boolean;
  student_signed_at: string | null;
  recruiter_signed_at: string | null;
  student_ip: string | null;
  recruiter_ip: string | null;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  pdf_url: string | null;
}

export interface DBCompletion {
  id: string;
  application_id: string;
  requested_by: string;
  requested_at: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  type: CompletionType;
  flagged_for_audit: boolean;
  auto_confirmed: boolean;
}

export interface DBCertificate {
  id: string;
  user_id: string;
  opportunity_id: string;
  application_id: string;
  public_url: string;
  issued_at: string;
  type: CertificateType;
}

export interface DBXpEvent {
  id: string;
  user_id: string;
  action: string;
  xp_awarded: number;
  created_at: string;
  reference_id: string | null;
}

export interface DBReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  application_id: string;
  rating: number;
  body: string;
  created_at: string;
  flagged: boolean;
}

export interface DBNotification {
  id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
  channel: NotificationChannel;
}

export interface DBChatRoom {
  id: string;
  type: ChatRoomType;
  created_at: string;
}

export interface DBChatParticipant {
  room_id: string;
  user_id: string;
}

export interface DBChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  file_url: string | null;
  created_at: string;
}

export interface DBFollow {
  follower_id: string;
  followee_id: string;
  created_at: string;
}

export interface DBIdentityVerification {
  id: string;
  user_id: string;
  document_url: string;
  status: IdentityVerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
}

export interface DBAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string | null;
  created_at: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface OpportunitySearchFilters {
  field?: string;
  type?: OpportunityType;
  duration?: number;
  location?: string;
  xp_tier?: "low" | "medium" | "high";
}

export interface OpportunitySearchResult extends DBOpportunity {
  company_name?: string;
  recruiter_name?: string;
}

// ─── XP / Level ───────────────────────────────────────────────────────────────

export interface XPLevel {
  level: number;
  label: string;
  minXP: number;
  maxXP: number | null;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, label: "Starter",        minXP: 0,    maxXP: 200   },
  { level: 2, label: "Rising Talent",  minXP: 201,  maxXP: 600   },
  { level: 3, label: "Experienced",    minXP: 601,  maxXP: 1200  },
  { level: 4, label: "Pro",            minXP: 1201, maxXP: 2500  },
  { level: 5, label: "Elite",          minXP: 2501, maxXP: null  },
];