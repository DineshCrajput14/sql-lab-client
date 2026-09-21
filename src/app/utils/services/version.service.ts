import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, shareReplay } from "rxjs/operators";
import { EMPTY, of } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class VersionService {
  constructor(private http: HttpClient) {}

  getBackendApiVersion() {
    return this.http
      .get<{ success: boolean; message: string; version: string }>(
        environment.apiBasePath + "health"
      )
      .pipe(
        shareReplay(1),
        catchError((err) => {
          return of({
            success: false,
            message: "Backend Offline",
            version: "1.0.0",
          });
        })
      );
  }
}
