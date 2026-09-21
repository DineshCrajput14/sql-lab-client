import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { CitiesService } from "./cities.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { CitiesEditorComponent } from "./cities-editor/cities-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-cities",
  templateUrl: "./cities.component.html",
})
export class CitiesComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  countries: { id: number; name: string }[] = [];
  states: [];
  search = {
    countryId: undefined,
    stateId: undefined,
  };
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  stateLengthArrayIsEmpty: boolean;
  isGetCitiesCallComplete: boolean = false;
  gridRowDataCities = [];
  rowCount: number = 0;
  gridColumnDefsCities = [
    {
      headerName: "City Name",
      field: "name",
      width: 280,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Action",
      field: "Action",
      width: 155,
      // hide:
      //   !this.authService.findActivityPermission(
      //     "Miscellaneous",
      //     "Masters",
      //     "Edit"
      //   ) &&
      //   !this.authService.findActivityPermission(
      //     "Miscellaneous",
      //     "Masters",
      //     "Delete"
      //   ),
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editCityModal.bind(this),
        onDelete: this.deleteCityModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private toastrMessage: ToastrMessage,
    private citiesService: CitiesService,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Cities | PMS");
    this.search.countryId = this.authService.authentication.organization.country?.id;
    this.search.stateId = this.authService.authentication.organization.state?.id;
    this.getCountries();
  }

  getCountries() {
    this.isLoading = true;
    this.countries = [];
    this.citiesService.getCountries().subscribe({
      next: (resultGetCountries) => {
        if (resultGetCountries && (resultGetCountries.countries || []).length) {
          this.countries = resultGetCountries.countries;
          this.getStates();
        } else {
          this.stateLengthArrayIsEmpty = true;
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getStates() {
    this.gridRowDataCities = [];
    this.states = [];
    this.isGetCitiesCallComplete = false;
    if (!this.search.countryId) {
      return;
    }
    this.isLoading = true;
    this.citiesService.getCountryStates(this.search.countryId).subscribe({
      next: (resultGetStates) => {
        if (resultGetStates && (resultGetStates.states || []).length) {
          this.states = resultGetStates.states;
          if (
            this.search.countryId !==
            this.authService.authentication.organization.country?.id
          ) {
            this.search.stateId = resultGetStates.states[0].id;
          }
          this.getCities();
        } else {
          this.stateLengthArrayIsEmpty = true;
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getCities() {
    this.stateLengthArrayIsEmpty = false;
    this.gridRowDataCities = [];
    this.rowCount = 0;
    if (!this.search.stateId) {
      return;
    }
    this.isLoading = true;
    this.citiesService.getStateCities(this.search.stateId).subscribe({
      next: (resultGetCities) => {
        if (resultGetCities && (resultGetCities.cities || []).length) {
          this.gridRowDataCities = resultGetCities.cities.map((city) => ({
            ...city,
            resource: "Masters",
            module: "Miscellaneous",
          }));
          this.rowCount = this.gridRowDataCities.length;
        }
        this.isGetCitiesCallComplete = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onFilterChanged(params) {
    this.rowCount = params.api?.getDisplayedRowCount();
  }

  onChangeCountry() {
    if (
      this.search.countryId ===
      this.authService.authentication.organization.country?.id
    ) {
      this.search.stateId = this.authService.authentication.organization.state?.id;
    } else {
      this.search.stateId = undefined;
    }
    this.getStates();
  }

  onChangeState() {
    this.getCities();
  }

  editCityModal(data) {
    const bsModalRef = this.modalService.show(CitiesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        selectedCountryId: this.search.countryId,
        selectedStateId: this.search.stateId,
        cityEditId: data.id,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getCities();
        }
        subscription.unsubscribe();
      },
    });
  }

  newCityModal() {
    const bsModalRef = this.modalService.show(CitiesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        selectedCountryId: this.search.countryId,
        selectedStateId: this.search.stateId,
        formState: "NEW",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getCities();
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteCityModal(data) {
    let name: string;
    this.gridRowDataCities.find((city) => {
      if (city.id === data.id) {
        name = city.name;
      }
    });

    if (!name) {
      return;
    }

    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the city <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.citiesService.delete(data.id).subscribe({
            next: () => {
              this.getCities();
              this.toastrMessage.showSuccessMessage("City Deleted");
            },
            error: (error) => {
              this.isLoading = false;
              this.errorHandlingService.errors(error);
            },
          });
        }
        subscription.unsubscribe();
      },
    });
  }
}
