// ─────────────────────────────────────────────────────────────────────────────
// Catalogue Service API models (mirrors docs/api/catalogue.json).
// Productions and their performances. All endpoints require a JWT.
// ─────────────────────────────────────────────────────────────────────────────

import { CommonResponse } from './auth.models';

export type ApiLanguage = 'SINHALA' | 'TAMIL' | 'ENGLISH';
export type SessionType = 'MATINEE' | 'EVENING';

/** Production status: 1 = Active, 9 = Inactive/Archived. */
export type ProductionStatus = number;

export interface ProductionItem {
  productionId: string;
  titleEn?: string;
  titleSi?: string;
  titleTa?: string;
  language?: ApiLanguage;
  genre?: string;
  descriptionEn?: string;
  descriptionSi?: string;
  descriptionTa?: string;
  baseTicketCost?: number;
  releaseDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  posterImageUrl?: string;
  status?: ProductionStatus;
}

export interface PerformanceItem {
  performanceId: string;
  productionId: string;
  date?: string; // yyyy-MM-dd
  time?: string; // HH:mm(:ss) local
  sessionType?: SessionType;
  releaseDate?: string;
  earlyAccessOpensAt?: string;
  isEarlyAccessActive?: boolean;
  status?: number;
}

export interface ProductionResponse extends CommonResponse, ProductionItem {}

export interface ProductionListResponse extends CommonResponse {
  productions?: ProductionItem[];
}

export interface PerformanceResponse extends CommonResponse, PerformanceItem {}

export interface PerformanceListResponse extends CommonResponse {
  performances?: PerformanceItem[];
}

export interface ProductionSummaryResponse extends CommonResponse {
  active?: number;
  upcoming?: number;
  inactive?: number;
  total?: number;
}

/** Generic paginated envelope used by the search endpoints. */
export interface PagedResponse<T> extends CommonResponse {
  content?: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export type ProductionSearchResponse = PagedResponse<ProductionItem>;
export type PerformanceSearchResponse = PagedResponse<PerformanceItem>;

/** Query params for GET /productions/search. */
export interface ProductionSearchParams {
  q?: string;
  status?: number;
  upcoming?: boolean;
  page?: number;
  size?: number;
  sort?: string; // e.g. "releaseDate,desc"
}

/** Query params for GET /performances/search. */
export interface PerformanceSearchParams {
  productionId?: string;
  dateFrom?: string; // yyyy-MM-dd
  dateTo?: string; // yyyy-MM-dd
  sessionType?: SessionType;
  status?: number;
  page?: number;
  size?: number;
  sort?: string;
}
