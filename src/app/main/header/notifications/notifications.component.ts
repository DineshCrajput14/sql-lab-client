import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
})
export class NotificationsComponent implements OnInit {
  isExpanded: boolean = false;
  notifications = [];

  constructor() {}

  ngOnInit() {
    this.notifications = [];
    if (this.notifications.length > 3) {
      this.isExpanded = true;
    }
  }
}
