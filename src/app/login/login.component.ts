import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../utils/services/auth.service";
import { ToastrMessage } from "../utils/services/toastrmessage.service";
import { NgForm } from "@angular/forms";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  publicConfig = {
    organization: <any>{},
    controlPanelSettings: <any>{},
  };
  login: {
    username: string;
    password: string;
  } = {
    username: "",
    password: "",
  };
  reasonMessage: string;
  capsLockOn: boolean;
  showPassword: boolean = false;
  showPasswordIsEnabled: boolean = false;
  isLoading: boolean = false;
  logoutReason: string;
  organizationLogoUrl: string;

  constructor(
    private authService: AuthService,
    private toastrMessage: ToastrMessage,
    private router: Router,
    private title: Title,
    private route: ActivatedRoute
  ) {
    const reason = this.router.getCurrentNavigation()?.extras?.state
      ?.logoutReason;
    if (reason) {
      this.showLogoutReasonMessage(reason);
    }
  }

  ngOnInit() {
    this.title.setTitle("Puma Group PMS - Login");
    this.organizationLogoUrl = "assets/img/pms-logo.svg";
  }

  showLogoutReasonMessage(reason: string) {
    this.logoutReason = reason;

    if (reason === "timeout") {
      this.reasonMessage =
        "To protect your data, application has logged out. Please login again.";
    } else if (reason === "sessionExpired") {
      this.reasonMessage = "Session expired. please login again.";
    } else if (reason === "logout") {
      this.reasonMessage = "Logged Out Successfully.";
    }

    if (this.reasonMessage) {
      reason === "logout"
        ? this.toastrMessage.showSuccessMessage(this.reasonMessage)
        : this.toastrMessage.showWarning(this.reasonMessage);
    }
  }

  onClickShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onLoginClick(form: NgForm) {
    if (!window.navigator.onLine) {
      return this.toastrMessage.showOfflineMessage();
    }
    this.logIn(form);
  }

  logIn(form: NgForm) {
    this.isLoading = true;
    this.authService.login(this.login.username, this.login.password).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams.returnUrl || "/";
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.showPasswordIsEnabled = false;
        this.showPassword = false;
        this.isLoading = false;
        if (err && !err.success && window.navigator.onLine) {
          this.toastrMessage.showErrorMessage(err.message || "Login failed");
        }
        if (err && err.message) {
          this.reasonMessage = err.message;
          this.toastrMessage.showWarning(this.reasonMessage);
        }
        if (!window.navigator.onLine) {
          this.toastrMessage.showOfflineMessage();
        }
      },
    });
  }

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    this.capsLockOn =
      typeof event.getModifierState === "function" &&
      event.getModifierState("CapsLock");
  }
}
