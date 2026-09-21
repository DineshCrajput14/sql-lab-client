import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PropertiesService {
  constructor(private http: HttpClient) {}

  getProperties(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/properties", { params });
  }

  getProperty(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/properties/" + id);
  }

  create(params) {
    return this.http.post(environment.apiBasePath + "v1/properties", params);
  }

  update(id: number, params) {
    return this.http.put(
      environment.apiBasePath + "v1/properties/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/properties/" + id);
  }
}
