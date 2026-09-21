import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CitiesService {
  constructor(private http: HttpClient) {}

  getCountries(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/countries");
  }

  getCountryStates(id: number): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/countries/" + id + "/states"
    );
  }

  getStates(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/states");
  }

  getCities(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/cities");
  }

  getStateCities(id: number): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/states/" + id + "/cities"
    );
  }

  getCity(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/cities/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/cities", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/cities/" + id, params);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/cities/" + id);
  }
}
