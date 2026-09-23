// ─────────────────────────────────────────────────────────────────────────────
// Identity Service API models (mirrors the OpenAPI spec at /v3/api-docs).
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  statusCode: string;
  statusDescription: string;
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
  password: string;
}

export interface PatronRegisterResponse {
  statusCode: string;
  statusDescription: string;
  patronId: string;
  name: string;
  email: string;
}

/** The authenticated user profile we keep in memory / storage. */
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}
