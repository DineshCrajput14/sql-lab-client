import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  constructor() {}

  getApiBasePath(): string {
    return environment.apiBasePath;
  }
}
