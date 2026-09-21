import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AmenitiesService {
  constructor(private http: HttpClient) {}

  getAmenities(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/amenities");
  }

  getAmenity(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/amenities/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/amenities", params);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/amenities/" + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/amenities/" + id);
  }
}
