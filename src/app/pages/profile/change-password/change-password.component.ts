import { Component, HostListener, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { VERSION } from "src/environments/version";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  isLoading: boolean = false;
  showPasswordIsEnabled: boolean = false;
  showPassword: boolean = false;
  focusOnOldPasswordField: boolean = false;
  focusOnNewPasswordField: boolean = false;
  focusOnConfirmNewPasswordField: boolean = false;
  version = VERSION;
  change: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  } = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  capsLockOn: boolean;

  constructor(
    public authService: AuthService,
    private toastrMessage: ToastrMessage,
    private router: Router,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {}

  executeCaptcha() {
    this.onChangePassword();
  }

  onChangePassword() {
    if (this.change.oldPassword === this.change.newPassword) {
      this.toastrMessage.showWarning(
        "New password must be different from the old password."
      );
      return;
    }

    this.isLoading = true;
    this.authService
      .changePassword(this.change.oldPassword, this.change.newPassword)
      .subscribe({
        next: () => {
          this.toastrMessage.showSuccessMessage("Password Changed");
          this.router.navigate(["/profile"]);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.change.oldPassword = "";
          this.change.newPassword = "";
          this.change.confirmPassword = "";
          this.errorHandlingService.errors(error);
        },
      });
  }

  onOldPasswordInputEnabled() {
    this.focusOnOldPasswordField = true;
    this.focusOnNewPasswordField = false;
    this.focusOnConfirmNewPasswordField = false;
  }

  onNewPasswordInputEnabled() {
    this.focusOnOldPasswordField = false;
    this.focusOnNewPasswordField = true;
    this.focusOnConfirmNewPasswordField = false;
  }

  onConfirmPasswordInputEnabled() {
    this.focusOnOldPasswordField = false;
    this.focusOnNewPasswordField = false;
    this.focusOnConfirmNewPasswordField = true;
  }

  onClickShowPassword() {
    this.showPassword = !this.showPassword;
  }

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    this.capsLockOn =
      typeof event.getModifierState === "function" &&
      event.getModifierState("CapsLock");
  }
}
