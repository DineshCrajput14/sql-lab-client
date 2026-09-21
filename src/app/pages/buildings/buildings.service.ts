import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class BuildingsService {
  constructor(private http: HttpClient) {}

  getBuildings(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/buildings", { params });
  }

  getBuilding(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/buildings/" + id);
  }

  create(params) {
    return this.http.post(environment.apiBasePath + "v1/buildings", params);
  }

  update(id: number, params) {
    return this.http.put(
      environment.apiBasePath + "v1/buildings/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/buildings/" + id);
  }

  getPropertyTypes(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/property-types");
  }
}
