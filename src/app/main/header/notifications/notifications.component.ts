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
    this.notifications = [
      {
        content: "This is announcement content for a short announcement. ",
        time: "19/05/2025 04:05 AM",
      },
      {
        content:
          "This is announcement content for a long announcement. I am writing this to check how long announcement can be and on the basis it's that we will set and height.",
        time: "19/05/2025 04:05 AM",
      },
    ];
    if (this.notifications.length > 3) {
      this.isExpanded = true;
    }
  }
}
