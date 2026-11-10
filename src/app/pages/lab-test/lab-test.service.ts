import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LabTestService {
  private apiUrl = environment.apiBasePath + "v1/test-tran";

  constructor(private http: HttpClient) {}

  // Get all Lab Test transactions
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get Lab Test transaction by ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get Lab Test transaction details
  getDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/details`);
  }

  // Create Lab Test transaction with details
  create(params: any): Observable<any> {
    return this.http.post(this.apiUrl, params);
  }

  // Update Lab Test transaction with details
  update(id: number, params: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, params);
  }

  // Delete Lab Test transaction
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get available Test Groups
  getTestGroups(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/testgroups");
  }

  // Get available Tests
  getTests(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/test-master");
  }

  getNextReferenceNo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/next-reference-no`);
  }

  getPatientTitle(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/patient-title");
  }

  getDoctors(): Observable<any> {
    const url = environment.apiBasePath + "v1/doctors";
    return this.http.get(environment.apiBasePath + "v1/doctors");
  }
}
