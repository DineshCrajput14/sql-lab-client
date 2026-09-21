import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  setCurrentTabIndex = 0;
  setCurrentTabName = "";

  constructor(private http: HttpClient) {}

  getControlPanel(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/control-panel-settings");
  }

  save(data): Observable<any> {
    return this.http.post(
      environment.apiBasePath + "v1/control-panel-settings",
      data
    );
  }
}
