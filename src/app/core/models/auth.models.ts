// ─────────────────────────────────────────────────────────────────────────────
// Identity Service API models (mirrors the OpenAPI spec at /v3/api-docs).
// See docs/api/identity.json.
// ─────────────────────────────────────────────────────────────────────────────

/** Base envelope shared by every Identity response. */
export interface CommonResponse {
  statusCode: string;
  statusDescription: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends CommonResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface PatronRegisterRequest {
  name: string;
  email: string;
  /** Contact number, e.g. 0771234567 or +94771234567. */
  contactNo?: string;
  /** ISO date (yyyy-MM-dd). Required by the API. */
  dateOfBirth: string;
  /** NIC or passport number. Required by the API. */
  nicPassportNo: string;
  password: string;
}

export interface PatronRegisterResponse extends CommonResponse {
  patronId: string;
  email: string;
}

/** Response from POST /patron/{patronId}/loyalty. */
export interface LoyaltyEnrollResponse extends CommonResponse {
  patronId: string;
  loyaltyCardNo: string;
}

/** Read-only patron summary returned by the admin lookups. */
export interface PatronSummary {
  patronId: string;
  name: string;
  email: string;
  contactNo?: string;
  dateOfBirth?: string;
  nicPassportNo?: string;
  verified?: boolean;
  loyaltyCardNo?: string;
  loyaltyHolder?: boolean;
  status?: number;
  addedDate?: string;
}

export interface PatronDetailResponse extends CommonResponse {
  patron?: PatronSummary;
}

export interface PatronListResponse extends CommonResponse {
  totalCount?: number;
  patrons?: PatronSummary[];
}

/** The authenticated user profile we keep in memory / storage. */
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}
