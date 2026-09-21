import { Injectable } from "@angular/core";
import { ToastrMessage } from "./toastrmessage.service";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlingService {
  constructor(private toastrMessage: ToastrMessage) {}

  errors(error) {
    if (!window.navigator.onLine) {
      return this.toastrMessage.showOfflineMessage();
    }
    const msg = error?.error?.message || error?.message;
    if (msg) {
      return this.toastrMessage.showErrorMessage(msg);
    }
    this.toastrMessage.showError();
  }
}
