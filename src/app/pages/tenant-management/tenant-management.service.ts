import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class TenantManagementService {
  constructor(private http: HttpClient) {}

  getTenants(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/tenants", {
      params,
    });
  }

  getTenant(tenantId: number, params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/tenants/" + tenantId, {
      params,
    });
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/tenants", params);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/tenants/" + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/tenants/" + id);
  }

  getAllotments(tenantId?: number, params?: any): Observable<any> {
    if (tenantId) {
      return this.http.get(
        environment.apiBasePath + "v1/tenants/" + tenantId + "/allotments",
        { params }
      );
    }
    return this.http.get(environment.apiBasePath + "v1/allotments", { params });
  }

  getAllotment(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/allotments/" + id);
  }

  createAllotment(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/allotments", params);
  }

  updateAllotment(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/allotments/" + id, data);
  }

  deleteAllotment(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/allotments/" + id);
  }

  getRentReceipts(tenantId?: number, params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/fee-receipts", {
      params: tenantId ? { ...params, tenantId } : params,
    });
  }

  getRentReceipt(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/fee-receipts/" + id);
  }

  createRentReceipt(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/fee-receipts", params);
  }

  updateRentReceipt(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/fee-receipts/" + id,
      params
    );
  }

  deleteRentReceipt(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/fee-receipts/" + id);
  }

  getTenantRentDueDates(id: number, params: any): Observable<any> {
    return this.http.get(
      environment.apiBasePath +
        "v1/fee-receipts/" +
        (id || 0) +
        "/tenant-detail",
      { params }
    );
  }

  getTenantLedger(tenantId: number, params?: any): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/tenants/" + tenantId + "/ledger",
      { params }
    );
  }

  getTenantSecurityLedger(tenantId: number, params?: any): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/tenants/" + tenantId + "/security-ledger",
      { params }
    );
  }
}
