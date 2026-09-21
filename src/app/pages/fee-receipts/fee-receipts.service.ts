import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class FeeReceiptsService {
  constructor(private http: HttpClient) {}

  getFeeReceipts(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/fee-receipts", {
      params,
    });
  }

  getFeeReceipt(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/fee-receipts/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/fee-receipts", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/fee-receipts/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/fee-receipts/" + id);
  }

  getReceiptModes(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/receipt-modes");
  }

  getTenantDetail(id: number, params: any): Observable<any> {
    return this.http.get(
      environment.apiBasePath +
        "v1/fee-receipts/" +
        (id || 0) +
        "/tenant-detail",
      { params }
    );
  }

  getReceiptPrintData(id: number): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/fee-receipts/" + id + "/print"
    );
  }
}
