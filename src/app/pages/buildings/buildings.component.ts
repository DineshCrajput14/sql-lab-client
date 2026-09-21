import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { BuildingsService } from "./buildings.service";
import { PropertiesService } from "../properties/properties.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { BuildingsEditorComponent } from "./buildings-editor/buildings-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-buildings",
  templateUrl: "./buildings.component.html",
})
export class BuildingsComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  buildings = [];
  properties = [];
  search: {
    propertyId: number;
  } = {
    propertyId: undefined,
  };
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataBuildings: any[] = [];
  rowCount: number = 0;

  gridColumnDefsBuildings = [
    {
      headerName: "Block Name",
      field: "name",
      width: 220,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Property Type",
      field: "propertyTypeName",
      width: 200,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Total Floors",
      field: "totalFloors",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Details",
      field: "description",
      width: 280,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Action",
      field: "Action",
      width: 155,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editBuildingModal.bind(this),
        onDelete: this.deleteBuildingModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private toastrMessage: ToastrMessage,
    private buildingsService: BuildingsService,
    private propertiesService: PropertiesService,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Building | PMS");
    this.getProperties();
  }
  getProperties() {
    this.isLoading = true;
    this.properties = [];
    this.propertiesService.getProperties().subscribe({
      next: (resultGetProperties) => {
        if (
          resultGetProperties &&
          (resultGetProperties.properties || []).length
        ) {
          this.properties = resultGetProperties.properties;
          if (this.properties.length) {
            this.search.propertyId = resultGetProperties.properties[0].id;
            this.getBuildings();
          }
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorHandlingService.errors(err);
      },
    });
  }
  getBuildings() {
    this.gridRowDataBuildings = [];
    this.rowCount = 0;
    if (!this.search.propertyId) {
      return;
    }
    this.isLoading = true;
    this.buildingsService
      .getBuildings({ propertyId: this.search.propertyId })
      .subscribe({
        next: (resultGetBuildings) => {
          if (
            resultGetBuildings &&
            (resultGetBuildings.buildings || []).length
          ) {
            this.gridRowDataBuildings = resultGetBuildings.buildings.map(
              (building) => ({
                ...building,
              })
            );
            this.rowCount = this.gridRowDataBuildings.length;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorHandlingService.errors(err);
        },
      });
  }
  onGridReady(params) {
    this.gridApi = params.api;
  }
  onFilterChanged(params) {
    this.rowCount = params.api?.getDisplayedRowCount();
  }
  editBuildingModal(data) {
    const bsModalRef = this.modalService.show(BuildingsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        buildingEditId: data.id,
        selectedPropertyId: data.propertyId,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getBuildings();
        }
        subscription.unsubscribe();
      },
    });
  }
  newBuildingModal() {
    const bsModalRef = this.modalService.show(BuildingsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        selectedPropertyId: this.search.propertyId,
        formState: "NEW",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getBuildings();
        }
        subscription.unsubscribe();
      },
    });
  }
  deleteBuildingModal(data) {
    let name: string;
    this.gridRowDataBuildings.find((building) => {
      if (building.id === data.id) {
        name = building.name;
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
        message: `Do you want to remove the building <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.buildingsService.delete(data.id).subscribe({
            next: () => {
              this.getBuildings();
              this.toastrMessage.showSuccessMessage(
                "Building Deleted Successfully"
              );
            },
            error: (err) => {
              this.isLoading = false;
              this.errorHandlingService.errors(err);
            },
          });
        }
        subscription.unsubscribe();
      },
    });
  }
}
