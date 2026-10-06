import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { AuthService } from "src/app/utils/services/auth.service";
import { CitiesService } from "src/app/pages/cities/cities.service";
import { SettingsService } from "src/app/pages/settings/settings.service";
import { TenantManagementService } from "../tenant-management.service";
import moment from "moment";

@Component({
  selector: "app-tenant-editor",
  templateUrl: "./tenant-editor.component.html",
})
export class TenantEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  isRegNoAuto: boolean;
  formState: string;
  tenantEditId: number;
  lastSavedTenantId: number;
  onClose = new Subject<any>();
  countries: [];
  states: [];
  cities: [];

  identityProofTypes: string[] = [
    "Driving License",
    "Passport",
    "Aadhaar Card",
    "National ID",
    "Voter ID",
    "Other",
  ];

  tenant: {
    regNo: string;
    regDate: any;
    name: string;
    address: string;
    mobileNo: string;
    countryId: number;
    stateId: number;
    cityId: number;
    identityProof: string;
    identityProofNumber: string;
    nextOfKinName: string;
    nextOfKinMobileNo: string;
    nextOfKinAddress: string;
    status: string;
    inactiveDate: any;
  } = {
    regNo: "",
    regDate: moment().toDate(),
    name: "",
    address: "",
    mobileNo: "",
    countryId: undefined,
    stateId: undefined,
    cityId: undefined,
    identityProof: "Driving License",
    identityProofNumber: "",
    nextOfKinName: "",
    nextOfKinMobileNo: "",
    nextOfKinAddress: "",
    status: "Active",
    inactiveDate: null,
  };

  constructor(
    public bsModalRef: BsModalRef,
    private tenantService: TenantManagementService,
    private settingsService: SettingsService,
    private citiesService: CitiesService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.getCountries();

    if (this.formState === "EDIT" && this.tenantEditId) {
      this.getTenant(this.tenantEditId);
    } else {
      this.getControlPanelSettings();
    }
  }

  getControlPanelSettings() {
    this.settingsService.getControlPanel().subscribe({
      next: (resultGetControlPanelSettings) => {
        if (
          resultGetControlPanelSettings?.controlPanelSetting
            ?.tenantRegistrationNumberAuto
        ) {
          this.isRegNoAuto = true;
          if (resultGetControlPanelSettings?.nextNumber?.nextNumberTenant) {
            this.tenant.regNo = String(
              resultGetControlPanelSettings.nextNumber.nextNumberTenant
            );
          }
        } else {
          this.isRegNoAuto = false;
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  getCountries() {
    this.isLoading = true;
    this.citiesService.getCountries().subscribe({
      next: (response) => {
        if (response && (response.countries || []).length) {
          this.countries = response.countries;
          if (this.tenant.countryId) {
            this.getStates(this.tenant.countryId);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getStates(countryId: number) {
    this.states = [];
    this.cities = [];
    if (!countryId) {
      return;
    }
    this.citiesService.getCountryStates(countryId).subscribe({
      next: (response) => {
        if (response && (response.states || []).length) {
          this.states = response.states;
          if (this.tenant.stateId) {
            this.getCities(this.tenant.stateId);
          }
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  getCities(stateId: number) {
    this.cities = [];
    if (!stateId) {
      return;
    }
    this.citiesService.getStateCities(stateId).subscribe({
      next: (response) => {
        if (response && (response.cities || []).length) {
          this.cities = response.cities;
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  onChangeCountry() {
    this.tenant.stateId = undefined;
    this.tenant.cityId = undefined;
    this.states = [];
    this.cities = [];
    if (this.tenant.countryId) {
      this.getStates(this.tenant.countryId);
    }
  }

  onChangeState() {
    this.tenant.cityId = undefined;
    this.cities = [];
    if (this.tenant.stateId) {
      this.getCities(this.tenant.stateId);
    }
  }

  onChangeStatus() {
    this.tenant.inactiveDate =
      this.tenant.status === "Inactive"
        ? this.tenant.inactiveDate || moment().toDate()
        : null;
  }

  getTenant(tenantId) {
    this.isLoading = true;
    const params = {
      view: false,
    };
    this.tenantService.getTenant(tenantId, params).subscribe({
      next: (resultGetTenant) => {
        const tenant = resultGetTenant?.tenant;
        if (tenant) {
          this.tenant = {
            regNo: tenant.regNo,
            regDate: tenant.regDate
              ? moment(tenant.regDate).toDate()
              : moment().toDate(),
            name: tenant.name,
            address: tenant.address,
            mobileNo: tenant.mobileNo,
            countryId: tenant.countryId,
            stateId: tenant.stateId,
            cityId: tenant.cityId,
            identityProof: tenant.identityProof,
            identityProofNumber: tenant.identityProofNumber,
            nextOfKinName: tenant.nextOfKinName,
            nextOfKinMobileNo: tenant.nextOfKinMobileNo,
            nextOfKinAddress: tenant.nextOfKinAddress,
            status: tenant.status,
            inactiveDate: tenant.inactiveDate
              ? moment(tenant.inactiveDate).toDate()
              : null,
          };

          if (this.tenant.countryId) {
            this.getStates(this.tenant.countryId);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  save() {
    this.saveTenant(true);
  }

  saveAndAddMore() {
    this.saveTenant(false);
  }

  saveTenant(closeTheModal) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      regNo: this.tenant.regNo,
      regDate: this.tenant.regDate
        ? moment(this.tenant.regDate).format("YYYY-MM-DD")
        : "",
      name: this.tenant.name,
      address: this.tenant.address,
      mobileNo: this.tenant.mobileNo,
      countryId: this.tenant.countryId,
      stateId: this.tenant.stateId,
      cityId: this.tenant.cityId,
      identityProof: this.tenant.identityProof,
      identityProofNumber: this.tenant.identityProofNumber,
      nextOfKinName: this.tenant.nextOfKinName,
      nextOfKinMobileNo: this.tenant.nextOfKinMobileNo,
      nextOfKinAddress: this.tenant.nextOfKinAddress,
      status: this.tenant.status,
      inactiveDate:
        this.tenant.status === "Inactive" && this.tenant.inactiveDate
          ? moment(this.tenant.inactiveDate).format("YYYY-MM-DD")
          : null,
    };

    if (this.formState === "EDIT") {
      observable = this.tenantService.update(this.tenantEditId, params);
    } else if (this.formState === "NEW") {
      observable = this.tenantService.create(params);
    }

    observable.subscribe({
      next: (response) => {
        const tenantId = response?.id || this.tenantEditId;
        if (tenantId) {
          this.lastSavedTenantId = tenantId;
        }
        if (closeTheModal) {
          this.onClose.next({
            dataChanged: this.dataChanged,
            tenantId: tenantId,
            status: this.tenant.status,
          });
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Tenant Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Tenant Updated");
          }
        } else {
          this.formState = "NEW";
          this.resetForm();
          this.toastrMessage.showSuccessMessage("Tenant Added");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  resetForm() {
    this.tenant = {
      regNo: "",
      regDate: moment().toDate(),
      name: "",
      address: "",
      mobileNo: "",
      countryId: undefined,
      stateId: undefined,
      cityId: undefined,
      identityProof: "Driving License",
      identityProofNumber: "",
      nextOfKinName: "",
      nextOfKinMobileNo: "",
      nextOfKinAddress: "",
      status: "Active",
      inactiveDate: null,
    };
    if (this.form) {
      this.form.resetForm();
      this.form.form.patchValue({
        tenantRegDate: moment().toDate(),
        tenantStatus: "Active",
        tenantIdentityProof: "Driving License",
      });
    }
    this.getControlPanelSettings();
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeyEscape() {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form.dirty) {
      this.cancelService.cancel(this.bsModalRef);
    }
  }
}
