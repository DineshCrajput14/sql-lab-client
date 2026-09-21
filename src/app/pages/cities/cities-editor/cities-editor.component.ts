import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CitiesService } from "../cities.service";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-cities-editor",
  templateUrl: "./cities-editor.component.html",
})
export class CitiesEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  countries: [];
  states: [];
  isLoading: boolean;
  selectedCountryId: number;
  selectedStateId: number;
  cityEditId: number;
  formState: string;
  cityName: string;
  onClose = new Subject<boolean>();
  dataChanged: boolean;

  constructor(
    private citiesService: CitiesService,
    public bsModalRef: BsModalRef,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    this.getCountries();
    if (this.formState === "EDIT") {
      this.editCity(this.cityEditId);
    }
  }

  getCountries() {
    this.isLoading = true;
    this.countries = [];
    this.citiesService.getCountries().subscribe({
      next: (resultGetCountries) => {
        if (resultGetCountries && (resultGetCountries.countries || []).length) {
          this.countries = resultGetCountries.countries;
          this.getStates();
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
    this.selectedStateId === undefined;
    if (!this.selectedCountryId) {
      return;
    }
    this.isLoading = true;
    this.citiesService.getCountryStates(this.selectedCountryId).subscribe({
      next: (resultGetStates) => {
        if (resultGetStates && (resultGetStates.states || []).length) {
          this.states = resultGetStates.states;
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
    this.getStates();
  }

  editCity(cityId: number) {
    this.isLoading = true;
    this.citiesService.getCity(cityId).subscribe({
      next: (resultEditCity) => {
        if (resultEditCity && resultEditCity.city) {
          this.cityName = resultEditCity.city.name;
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
    this.saveCity(true);
  }

  saveAndAddMore() {
    this.saveCity(false);
  }

  saveCity(closeTheModal: boolean) {
    this.form.controls.city.markAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.dataChanged = true;
    this.isLoading = true;
    let observable;
    const params = {
      name: this.cityName,
      stateId: this.selectedStateId,
    };
    if (this.formState === "EDIT") {
      observable = this.citiesService.update(this.cityEditId, params);
    } else if (this.formState === "NEW") {
      observable = this.citiesService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("City Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("City Updated");
          }
        } else {
          let countryIdTemp = this.selectedCountryId;
          let stateIdTemp = this.selectedStateId;
          this.formState = "NEW";
          this.form.resetForm();
          this.form.form.patchValue({
            country: countryIdTemp,
            state: stateIdTemp,
          });
          this.toastrMessage.showSuccessMessage("City Added");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
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
