import { Component, HostListener, OnInit } from "@angular/core";
import { AuthService } from "../utils/services/auth.service";
import { ToastrMessage } from "../utils/services/toastrmessage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "../utils/services/error-handling.service";
import { PublicCallsService } from "../utils/services/public-calls.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  isLoading: boolean = false;
  token: string = "";
  welcome: boolean = false;
  publicConfig = {
    organization: <any>{},
    controlPanelSettings: <any>{},
  };
  reset: {
    password: string;
    confirmPassword: string;
  } = {
    password: "",
    confirmPassword: "",
  };
  capsLockOn: boolean;
  isConfirmPassword: boolean = false;
  isNewPassword: boolean = false;
  focusOnNewPasswordField: boolean = false;
  focusOnConfirmNewPasswordField: boolean = false;
  showNewPasswordIsEnabled: boolean = false;
  showConfirmPasswordIsEnabled: boolean = false;
  organizationLogoUrl: string;

  constructor(
    private authService: AuthService,
    private toastrMessage: ToastrMessage,
    private router: Router,
    private title: Title,
    private publicCallsService: PublicCallsService,
    private activatedRoute: ActivatedRoute,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.getPublicConfig();
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        this.token = params["token"];
        this.welcome = params["welcome"];
      },
    });
  }

  onResetClick(form: NgForm) {
    if (!window.navigator.onLine) {
      return this.toastrMessage.showOfflineMessage();
    }
    this.onResetPassword(form);
  }

  onResetPassword(form: NgForm) {
    this.isLoading = true;
    this.authService.resetPassword(this.reset.password, this.token).subscribe({
      next: (resultResetPassword) => {
        if (this.welcome) {
          this.toastrMessage.showSuccessMessage(
            "Password Created Successfully. Please login now."
          );
        } else {
          this.toastrMessage.showSuccessMessage(
            "Password Changed Successfully. Please login now."
          );
        }
        this.router.navigate(["/login"]);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        form.resetForm();
        this.isNewPassword = false;
        this.isConfirmPassword = false;
        this.showNewPasswordIsEnabled = false;
        this.showConfirmPasswordIsEnabled = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getPublicConfig() {
    this.isLoading = true;
    this.publicCallsService.getPublicConfig().subscribe({
      next: (resultGetPublicConfig) => {
        if (resultGetPublicConfig) {
          this.publicConfig.organization = resultGetPublicConfig.organization;
          if (this.welcome) {
            this.title.setTitle(
              this.publicConfig.organization.name + " - Welcome"
            );
          } else {
            this.title.setTitle(
              this.publicConfig.organization.name + " - Reset Password"
            );
          }
          this.publicConfig.controlPanelSettings = {
            logoActualFileName:
              resultGetPublicConfig?.controlPanelSettings?.logoActualFileName,
          };
          this.setOrganizationLogoUrl();
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  setOrganizationLogoUrl() {
    if (this.publicConfig.controlPanelSettings.logoActualFileName) {
      this.organizationLogoUrl =
        this.publicConfig.organization.assetsBasePath +
        this.publicConfig.controlPanelSettings.logoActualFileName;
    } else {
      this.organizationLogoUrl = "assets/img/logo.svg";
    }
    this.isLoading = false;
  }

  onNewPasswordInputEnabled() {
    this.focusOnNewPasswordField = true;
    this.focusOnConfirmNewPasswordField = false;
  }

  onConfirmPasswordInputEnabled() {
    this.focusOnNewPasswordField = false;
    this.focusOnConfirmNewPasswordField = true;
  }

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    this.capsLockOn =
      typeof event.getModifierState === "function" &&
      event.getModifierState("CapsLock");
  }

  onClickShowNewPassword() {
    this.isNewPassword = !this.isNewPassword;
  }

  onClickShowConfirmPassword() {
    this.isConfirmPassword = !this.isConfirmPassword;
  }
}
