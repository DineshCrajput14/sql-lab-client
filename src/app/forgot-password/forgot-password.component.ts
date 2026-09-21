import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthService } from "../utils/services/auth.service";
import { ToastrMessage } from "../utils/services/toastrmessage.service";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ErrorHandlingService } from "../utils/services/error-handling.service";
import { PublicCallsService } from "../utils/services/public-calls.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean = false;
  publicConfig = {
    organization: <any>{},
    controlPanelSettings: <any>{},
  };
  forgot: {
    username: string;
  } = {
    username: "",
  };
  organizationLogoUrl: string;

  constructor(
    private authService: AuthService,
    private toastrMessage: ToastrMessage,
    private router: Router,
    private title: Title,
    private publicCallsService: PublicCallsService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.getPublicConfig();
  }

  onForgotClick() {
    if (!window.navigator.onLine) {
      return this.toastrMessage.showOfflineMessage();
    }
    this.onForgotPassword(this.form);
  }

  onForgotPassword(form: NgForm) {
    this.isLoading = true;
    this.authService.sendPasswordLink(this.forgot.username).subscribe({
      next: () => {
        this.toastrMessage.showSuccessMessage(
          "Please check your email for further instructions."
        );
        this.router.navigate(["/login"]);
        this.isLoading = false;
      },
      error: (err) => {
        if (!err.success && window.navigator.onLine) {
          let usernameEntered = this.forgot.username;
          this.form?.form.patchValue({
            username: usernameEntered,
          });
          this.isLoading = false;
          this.errorHandlingService.errors(err);
        }
      },
    });
  }

  getPublicConfig() {
    this.isLoading = true;
    this.publicCallsService.getPublicConfig().subscribe({
      next: (resultGetPublicConfig) => {
        if (resultGetPublicConfig) {
          this.publicConfig.organization = resultGetPublicConfig.organization;
          this.title.setTitle(
            resultGetPublicConfig.organization.name + " - Forget Password"
          );
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
}
