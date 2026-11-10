import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class GroupMasterService {
  constructor(private http: HttpClient) {}

  getGroups(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/testgroups");
  }

  getGroup(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/testgroups/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/testgroups", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/testgroups/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/testgroups/" + id);
  }

  // updateGroupOrder(groups: any[]) {
  //   return this.http.put(environment.apiBasePath + "v1/testgroups/order", {
  //     groups,
  //   });
  // }

  updateGroupOrder(groups: any[]) {
    return this.http.put(environment.apiBasePath + "v1/testgroups/order", {
      groups,
    });
  }
}
