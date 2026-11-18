import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LabTestService {
  constructor(private http: HttpClient) {}

  // Get all Lab Test transactions
  getAll(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/test-tran");
  }

  // Get Lab Test transaction by ID
  getById(id: number): Observable<any> {
    return this.http.get(environment.apiBasePath + `v1/test-tran/${id}`);
  }

  // Get Lab Test transaction details
  getDetails(id: number): Observable<any> {
    return this.http.get(
      environment.apiBasePath + `v1/test-tran/${id}/details`
    );
  }

  // Get Widal data by Lab Test ID
  getWidalData(id: number): Observable<any> {
    return this.http.get(
      environment.apiBasePath + `v1/test-tran/${id}/widal-data`
    );
  }

  // Save Widal data separately
  saveWidalData(id: number, data: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + `v1/test-tran/${id}/widal-data`,
      data
    );
  }

  // Create Lab Test transaction
  create(params: any): Observable<any> {
    return this.http.post(environment.apiBasePath + "v1/test-tran", params);
  }

  // Update Lab Test transaction
  update(id: number, params: any): Observable<any> {
    return this.http.put(
      environment.apiBasePath + `v1/test-tran/${id}`,
      params
    );
  }

  // Delete Lab Test transaction
  delete(id: number): Observable<any> {
    return this.http.delete(environment.apiBasePath + `v1/test-tran/${id}`);
  }

  // Get available Test Groups
  getTestGroups(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/testgroups");
  }

  // Get available Tests
  getTests(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/test-master");
  }

  // Get Next Reference Number
  getNextReferenceNo(): Observable<any> {
    return this.http.get(
      environment.apiBasePath + "v1/test-tran/next-reference-no"
    );
  }

  // Get Patient Titles
  getPatientTitle(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/patient-title");
  }

  // Get Doctors
  getDoctors(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/doctors");
  }

  // Get Widal Method options (By Tube / By Slide)
  getWidalMethods(): Observable<any> {
    return this.http.get(environment.apiBasePath + "v1/widal-methods");
  }
}
