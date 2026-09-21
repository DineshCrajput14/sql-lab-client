import { Component, Input, OnInit } from "@angular/core";
import { VERSION } from "src/environments/version";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  @Input() callingFrom;
  backend = {
    version: "v1",
  };
  version = VERSION;
  currentYear: number = new Date().getFullYear();

  constructor() {}

  ngOnInit() {}
}
