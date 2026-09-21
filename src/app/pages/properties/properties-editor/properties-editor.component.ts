import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { PropertiesService } from "../properties.service";
import { CitiesService } from "src/app/pages/cities/cities.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-properties-editor",
  templateUrl: "./properties-editor.component.html",
})
export class PropertiesEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  propertyEditId: number;

  selectedCountryId: number;
  selectedStateId: number;
  selectedCityId: number;

  countries = [];
  states = [];
  cities = [];

  property: {
    name: string;
    address: string;
    countryId: number;
    stateId: number;
    cityId: number;
    description: string;
    ownerName: string;
  } = {
    name: "",
    address: "",
    countryId: undefined,
    stateId: undefined,
    cityId: undefined,
    description: "",
    ownerName: "",
  };

  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private propertiesService: PropertiesService,
    private citiesService: CitiesService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if (this.selectedCountryId) {
      this.property.countryId = this.selectedCountryId;
    } else if (this.authService.authentication?.organization?.country?.id) {
      this.property.countryId = this.authService.authentication.organization.country.id;
    }

    if (this.selectedStateId) {
      this.property.stateId = this.selectedStateId;
    } else if (this.authService.authentication?.organization?.state?.id) {
      this.property.stateId = this.authService.authentication.organization.state.id;
    }

    if (this.selectedCityId) {
      this.property.cityId = this.selectedCityId;
    }

    this.getCountries();

    if (this.formState === "EDIT" && this.propertyEditId) {
      this.getProperty(this.propertyEditId);
    }
  }

  getCountries() {
    this.isLoading = true;
    this.countries = [];
    this.citiesService.getCountries().subscribe({
      next: (resultGetCountries) => {
        if (resultGetCountries && (resultGetCountries.countries || []).length) {
          this.countries = resultGetCountries.countries;
          if (this.property.countryId) {
            this.getStates();
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

  getStates() {
    this.states = [];
    this.cities = [];
    if (!this.property.countryId) {
      return;
    }
    this.isLoading = true;
    this.citiesService.getCountryStates(this.property.countryId).subscribe({
      next: (resultGetStates) => {
        if (resultGetStates && (resultGetStates.states || []).length) {
          this.states = resultGetStates.states;
          if (this.property.stateId) {
            this.getCities();
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

  getCities() {
    this.cities = [];
    if (!this.property.stateId) {
      return;
    }
    this.isLoading = true;
    this.citiesService.getStateCities(this.property.stateId).subscribe({
      next: (resultGetCities) => {
        if (resultGetCities && (resultGetCities.cities || []).length) {
          this.cities = resultGetCities.cities;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  onChangeCountry() {
    this.property.stateId = undefined;
    this.property.cityId = undefined;
    this.getStates();
  }

  onChangeState() {
    this.property.cityId = undefined;
    this.getCities();
  }

  getProperty(propertyId: number) {
    this.isLoading = true;
    this.propertiesService.getProperty(propertyId).subscribe({
      next: (resultGetProperty) => {
        if (resultGetProperty && resultGetProperty.property) {
          const prop = resultGetProperty.property;
          this.property.name = prop.name;
          this.property.address = prop.address;
          this.property.countryId = prop.countryId;
          this.property.stateId = prop.stateId;
          this.property.cityId = prop.cityId;
          this.property.description = prop.description;
          this.property.ownerName = prop.ownerName;

          if (this.property.countryId) {
            this.getStates();
          }
        } else if (resultGetProperty) {
          this.property.name = resultGetProperty.name;
          this.property.address = resultGetProperty.address;
          this.property.countryId = resultGetProperty.countryId;
          this.property.stateId = resultGetProperty.stateId;
          this.property.cityId = resultGetProperty.cityId;
          this.property.description = resultGetProperty.description;
          this.property.ownerName = resultGetProperty.ownerName;

          if (this.property.countryId) {
            this.getStates();
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
    this.saveProperty(true);
  }

  saveAndAddMore() {
    this.saveProperty(false);
  }

  saveProperty(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      name: this.property.name,
      address: this.property.address,
      countryId: this.property.countryId,
      stateId: this.property.stateId,
      cityId: this.property.cityId,
      description: this.property.description,
      ownerName: this.property.ownerName,
    };
    if (this.formState === "EDIT") {
      observable = this.propertiesService.update(this.propertyEditId, params);
    } else if (this.formState === "NEW") {
      observable = this.propertiesService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Property Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Property Updated");
          }
        } else {
          this.formState = "NEW";
          this.resetForm();
          this.toastrMessage.showSuccessMessage("Property Added");
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
    let defaultCountryId;
    let defaultStateId;
    if (this.authService.authentication?.organization?.country?.id) {
      defaultCountryId = this.authService.authentication.organization.country
        .id;
    }
    if (this.authService.authentication?.organization?.state?.id) {
      defaultStateId = this.authService.authentication.organization.state.id;
    }

    this.property = {
      name: "",
      address: "",
      countryId: defaultCountryId,
      stateId: defaultStateId,
      cityId: undefined,
      description: "",
      ownerName: "",
    };
    if (this.form) {
      this.form.resetForm();
      this.form.form.patchValue({
        country: defaultCountryId,
        state: defaultStateId,
      });
    }
    if (defaultCountryId) {
      this.getStates();
    }
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
