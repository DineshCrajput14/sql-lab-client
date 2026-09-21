import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthService } from "../utils/services/auth.service";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  public sidebarMenuOpened = true;
  @ViewChild("contentWrapper", { static: false }) contentWrapper;

  constructor(private authService: AuthService) {}

  ngOnInit() {}
}
