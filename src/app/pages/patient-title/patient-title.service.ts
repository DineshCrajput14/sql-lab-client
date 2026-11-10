import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PatientTitleService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/patient-title");
  }

  getById(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/patient-title/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/patient-title", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/patient-title/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/patient-title/" + id);
  }
}
