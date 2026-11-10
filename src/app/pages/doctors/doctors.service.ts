import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class DoctorsService {
  constructor(private http: HttpClient) {}

  getDoctors(): Observable<any> {
    const url = environment.apiBasePath + "v1/doctors";
    // console.log("[SERVICE] getDoctors URL:", url, params);
    return this.http.get(environment.apiBasePath + "v1/doctors");
  }

  getDoctor(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/doctors/" + id);
  }

  create(params) {
    return this.http.post(environment.apiBasePath + "v1/doctors", params);
  }

  update(id: number, params) {
    return this.http.put(environment.apiBasePath + "v1/doctors/" + id, params);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/doctors/" + id);
  }

  // getPropertyTypes(): Observable<any> {
  //   return this.http.get(environment.apiBasePath + "v1/property-types");
  // }
}
