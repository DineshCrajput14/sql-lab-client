import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class FeedbackCommentsService {
  constructor(private http: HttpClient) {}

  submit(params) {
    return this.http.post(
      environment.apiBasePath + "v1/feedback-comments",
      params
    );
  }
}
