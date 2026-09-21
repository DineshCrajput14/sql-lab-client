import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-page-not-found",
  templateUrl: "./page-not-found.component.html",
  styles: [],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {}
}
