import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CategoriesService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/categories");
  }

  getCategory(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/categories/" + id);
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/categories", params);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBasePath + "v1/categories/" + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/categories/" + id);
  }
}
