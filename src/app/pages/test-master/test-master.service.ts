import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class TestMasterService {
  constructor(private http: HttpClient) {}

  getTests(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/test-master");
  }

  getTestById(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/test-master/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/test-master", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/test-master/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/test-master/" + id);
  }

  getTestGroups(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/testgroups");
  }
}
