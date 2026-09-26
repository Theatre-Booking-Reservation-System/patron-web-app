import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PerformanceListResponse,
  PerformanceResponse,
  PerformanceSearchParams,
  PerformanceSearchResponse,
  ProductionListResponse,
  ProductionResponse,
  ProductionSearchParams,
  ProductionSearchResponse,
  ProductionSummaryResponse,
} from '../models/catalogue.models';

/**
 * Catalogue Service client — productions and performances.
 * The auth interceptor attaches the JWT required by every endpoint.
 * See docs/api/catalogue.json.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.services.catalogue;

  // ── Productions ────────────────────────────────────────────────────────────

  getAllProductions(): Observable<ProductionListResponse> {
    return this.http.get<ProductionListResponse>(`${this.baseUrl}/productions`);
  }

  getProductionById(id: string): Observable<ProductionResponse> {
    return this.http.get<ProductionResponse>(`${this.baseUrl}/productions/${id}`);
  }

  getPerformancesByProductionId(id: string): Observable<PerformanceListResponse> {
    return this.http.get<PerformanceListResponse>(
      `${this.baseUrl}/productions/${id}/performances`,
    );
  }

  getProductionSummary(): Observable<ProductionSummaryResponse> {
    return this.http.get<ProductionSummaryResponse>(`${this.baseUrl}/productions/summary`);
  }

  searchProductions(params: ProductionSearchParams = {}): Observable<ProductionSearchResponse> {
    return this.http.get<ProductionSearchResponse>(`${this.baseUrl}/productions/search`, {
      params: this.toParams(params),
    });
  }

  // ── Performances ─────────────────────────────────────────────────────────────

  getPerformanceById(id: string): Observable<PerformanceResponse> {
    return this.http.get<PerformanceResponse>(`${this.baseUrl}/performances/${id}`);
  }

  searchPerformances(params: PerformanceSearchParams = {}): Observable<PerformanceSearchResponse> {
    return this.http.get<PerformanceSearchResponse>(`${this.baseUrl}/performances/search`, {
      params: this.toParams(params),
    });
  }

  /** Build HttpParams, skipping null/undefined/empty values. */
  private toParams(obj: ProductionSearchParams | PerformanceSearchParams): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
