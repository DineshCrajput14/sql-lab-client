import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StandardReportsService {
  constructor(private http: HttpClient) {}

  getReportData(reportCode: string, params: any): Observable<any> {
    return this.http.get(environment.apiBasePath + `v1/reports/${reportCode}`, {
      params,
    });
  }
}
