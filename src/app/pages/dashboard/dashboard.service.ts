import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/dashboard-summary");
  }
}
