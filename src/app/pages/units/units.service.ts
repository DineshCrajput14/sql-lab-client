import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UnitsService {
  constructor(private http: HttpClient) {}

  getUnits(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/units", { params });
  }

  getUnit(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/units/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/units", params);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/units/" + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/units/" + id);
  }
}
