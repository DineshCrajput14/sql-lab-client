import { Component, HostListener } from "@angular/core";
import { LocationStrategy } from "@angular/common";
import { ToastrMessage } from "./utils/services/toastrmessage.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "PMS";
  openedModals = undefined;

  constructor(
    private locationStrategy: LocationStrategy,
    private toastrMessage: ToastrMessage
  ) {}

  // https://stackoverflow.com/questions/36357204/how-to-disable-browser-back-button-in-angular-2

  // Define a function to handle back button and use anywhere
  preventBackButton() {
    window.history.go(1);
    window.history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      window.history.pushState(null, null, window.location.href);
    });
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event) {
    this.openedModals = document.getElementsByTagName("modal-container");
    if (this.openedModals && (this.openedModals || []).length) {
      this.toastrMessage.showWarning(
        "Please close the open popups to proceed. * NOTE - If you are editing any form then please complete it and after clicking save/update button kindly refresh the page to see your recently saved changes. *"
      );
      this.preventBackButton();
    }
  }
}
