import { ToastrService, IndividualConfig } from "ngx-toastr";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: "root",
})
export class ToastrMessage {
  options: IndividualConfig;

  constructor(private toastr: ToastrService) {}

  showSuccess() {
    this.toastr.success("Successful");
  }

  showSuccessMessage(message) {
    this.toastr.success(message);
  }

  showInfoMessage(message) {
    this.toastr.info(message);
  }

  showWarning(message) {
    this.toastr.warning(message);
  }

  showError() {
    this.toastr.error("Something went wrong. Please try again.");
  }

  showErrorMessage(message) {
    this.toastr.error(message);
  }

  showTimeOutLogOut(message) {
    this.toastr.info(message, " ", {
      positionClass: "toast-top-full-width",
      disableTimeOut: true,
    });
  }

  showOfflineMessage() {
    this.toastr.error(
      "Please check your internet connection and reload this page."
    );
  }

  removeToastr() {
    this.toastr.clear();
  }
}
