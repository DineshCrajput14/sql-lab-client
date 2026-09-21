import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Idle } from "@ng-idle/core";

@Component({
  selector: "app-idletime-modal",
  templateUrl: "./idletime-modal.component.html",
  styleUrls: [],
})
export class IdletimeModalComponent implements OnInit {
  public countdown: number;

  constructor(public bsModalRef: BsModalRef, private idle: Idle) {}

  ngOnInit() {
    this.idle.onTimeoutWarning.subscribe({
      next: (countdown) => {
        this.countdown = countdown;
      },
    });
  }
}
