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
  isLoading: boolean;

  controlPanel: {
    tenantRegistrationNumberAuto: boolean;
  } = {
    tenantRegistrationNumberAuto: true,
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
        this.isLoading = false;
        if (resultGetControlPanelSettings?.controlPanelSetting) {
          this.controlPanel.tenantRegistrationNumberAuto =
            resultGetControlPanelSettings.controlPanelSetting.tenantRegistrationNumberAuto;
        }
        if (resultGetControlPanelSettings?.nextNumber) {
          this.nextNumber.nextNumberTenant =
            resultGetControlPanelSettings.nextNumber.nextNumberTenant;
        }
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
    };

    this.settingsService.save(params).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastrMessage.showSuccessMessage("Settings saved successfully");
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }
}
