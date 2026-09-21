import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/users", { params });
  }

  getUser(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/users/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/users", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/users/" + id, params);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/users/" + id);
  }

  getUserRoles(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/user-roles");
  }
}
