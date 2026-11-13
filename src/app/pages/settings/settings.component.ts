import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalService } from "ngx-bootstrap/modal";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { ConfirmModalComponent } from "src/app/pages/common/confirm-modal/confirm-modal.component";
import { SettingsService } from "./settings.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  isLoading: boolean = false;

  testTranDataAvailable: boolean = false;

  controlPanel: {
    tenantRegistrationNumberAuto: boolean;
    serialno: boolean;
    startSerialno: number | string;
  } = {
    tenantRegistrationNumberAuto: true,
    serialno: false,
    startSerialno: 1,
  };

  nextNumber: {
    nextNumberTenant: number | string;
  } = {
    nextNumberTenant: "1",
  };

  constructor(
    private title: Title,
    public authService: AuthService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    private settingsService: SettingsService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.title.setTitle("Settings | PMS");
    this.getControlPanel();
  }

  getControlPanel() {
    this.isLoading = true;

    this.settingsService.getControlPanel().subscribe({
      next: (resultGetControlPanelSettings) => {
        if (resultGetControlPanelSettings?.controlPanelSetting) {
          const setting = resultGetControlPanelSettings.controlPanelSetting;

          this.controlPanel.tenantRegistrationNumberAuto =
            setting.tenantRegistrationNumberAuto;

          this.controlPanel.serialno =
            setting.serialno === true ||
            setting.serialno === 1 ||
            setting.serialno === "1";

          this.controlPanel.startSerialno = setting.startSerialno ?? 1;
        }

        if (resultGetControlPanelSettings?.nextNumber) {
          this.nextNumber.nextNumberTenant =
            resultGetControlPanelSettings.nextNumber.nextNumberTenant;
        }

        this.checkTestTranData();
      },

      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  checkTestTranData() {
    this.settingsService.checkTestTranData().subscribe({
      next: (result) => {
        this.testTranDataAvailable =
          result?.dataAvailable === true ||
          result?.dataAvailable === 1 ||
          result?.dataAvailable === "1";

        // Update existing global Control Panel settings
        this.authService.authentication.controlPanelSettings = {
          ...this.authService.authentication.controlPanelSettings,
          testTranDataAvailable: this.testTranDataAvailable,
        };

        this.isLoading = false;
      },

      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  confirmSave() {
    const bsModalRef = this.modalService.show(ConfirmModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: "Are you sure you want to save settings?",
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.save();
        }

        subscription.unsubscribe();
      },
    });
  }

  save() {
    this.isLoading = true;

    const params = {
      tenantRegistrationNumberAuto: this.controlPanel
        .tenantRegistrationNumberAuto,

      nextNumberTenant: this.controlPanel.tenantRegistrationNumberAuto
        ? this.nextNumber.nextNumberTenant
        : undefined,

      serialno: this.controlPanel.serialno ? 1 : 0,

      startSerialno: this.controlPanel.startSerialno,
    };

    this.settingsService.save(params).subscribe({
      next: () => {
        this.toastrMessage.showSuccessMessage("Settings saved successfully");

        // Refresh global data availability after saving
        this.checkTestTranData();
      },

      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }
}
