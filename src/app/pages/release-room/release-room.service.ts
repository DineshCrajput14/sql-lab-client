import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReleaseRoomService {
  constructor(private http: HttpClient) {}

  getReleaseRooms(params?: any): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/release-room", {
      params,
    });
  }

  getReleaseRoom(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/release-room/" + id);
  }

  getTenantDetail(params: any): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/release-room/tenant-detail",
      { params }
    );
  }

  getReceiptModes(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/receipt-modes");
  }

  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/release-room", params);
  }

  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + "v1/release-room/" + id,
      params
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + "v1/release-room/" + id);
  }
}
