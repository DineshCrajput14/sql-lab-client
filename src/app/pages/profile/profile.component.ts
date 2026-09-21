import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/utils/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {}

  onChangePassword() {
    this.router.navigate(["/change-password"]);
  }
}
