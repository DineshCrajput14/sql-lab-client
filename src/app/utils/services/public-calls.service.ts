import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PublicCallsService {
  constructor(private http: HttpClient) {}

  getPublicConfig(): Observable<any> {
    return this.http.post(
      environment.apiBasePath + "public/v1/public-config",
      {}
    );
  }

  getCountries(): Observable<any> {
    return this.http.get(environment.apiBasePath + "public/v1/countries");
  }

  getGenders(): Observable<any> {
    return this.http.get(environment.apiBasePath + "public/v1/genders");
  }
}
