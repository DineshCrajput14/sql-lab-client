import { AfterViewInit, Component, Input } from "@angular/core";

@Component({
  selector: "app-notifications-block",
  templateUrl: "./notifications-block.component.html",
  styleUrls: ["./notifications-block.component.scss"],
})
export class NotificationsBlockComponent implements AfterViewInit {
  @Input() notifications = [];
  showNotificationBlocks: boolean = false;

  constructor() {}

  ngAfterViewInit() {
    if (this.notifications.length) {
      this.showNotificationBlocks = true;
    }
  }
}
