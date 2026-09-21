import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { UnitsService } from "./units.service";
import { PropertiesService } from "../properties/properties.service";
import { BuildingsService } from "../buildings/buildings.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { UnitsEditorComponent } from "./units-editor/units-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-units",
  templateUrl: "./units.component.html",
})
export class UnitsComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  properties = [];
  buildings = [];
  search: {
    propertyId: number;
    buildingId: number;
  } = {
    propertyId: undefined,
    buildingId: undefined,
  };
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataUnits = [];
  rowCount: number = 0;

  gridColumnDefsUnits = [
    {
      headerName: "Unit No",
      field: "unitNo",
      width: 180,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Floor",
      field: "floorName",
      width: 180,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Description",
      field: "description",
      width: 260,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Charges",
      field: "charges",
      width: 160,
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
        onEdit: this.editUnitModal.bind(this),
        onDelete: this.deleteUnitModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private unitsService: UnitsService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private toastrMessage: ToastrMessage,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Unit | PMS");
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
            this.onPropertyChange();
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
  onPropertyChange() {
    this.buildings = [];
    this.search.buildingId = undefined;
    this.gridRowDataUnits = [];
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
            this.buildings = resultGetBuildings.buildings;
            if (this.buildings.length) {
              this.search.buildingId = this.buildings[0].id;
              this.getUnits();
            } else {
              this.isLoading = false;
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
  getUnits() {
    this.gridRowDataUnits = [];
    this.rowCount = 0;
    if (!this.search.buildingId) {
      return;
    }
    this.isLoading = true;
    this.unitsService
      .getUnits({ buildingId: this.search.buildingId })
      .subscribe({
        next: (resultGetUnits) => {
          if (resultGetUnits && (resultGetUnits.units || []).length) {
            this.gridRowDataUnits = resultGetUnits.units.map((unit) => ({
              ...unit,
            }));
            this.rowCount = this.gridRowDataUnits.length;
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
  editUnitModal(data) {
    const bsModalRef = this.modalService.show(UnitsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        editUnitId: data.id,
        selectedPropertyId: this.search.propertyId,
        selectedBuildingId: data.buildingId || this.search.buildingId,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getUnits();
        }
        subscription.unsubscribe();
      },
    });
  }
  deleteUnitModal(data) {
    let unitNo: string;
    this.gridRowDataUnits.find((unit) => {
      if (unit.id === data.id) {
        unitNo = unit.unitNo;
      }
    });

    if (!unitNo) {
      return;
    }

    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the unit <b> "${unitNo}" </b>?`,
        name: unitNo,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.unitsService.delete(data.id).subscribe({
            next: () => {
              this.getUnits();
              this.toastrMessage.showSuccessMessage(
                "Unit Deleted Successfully"
              );
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
  newUnitModal() {
    const bsModalRef = this.modalService.show(UnitsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        selectedPropertyId: this.search.propertyId,
        selectedBuildingId: this.search.buildingId,
        formState: "NEW",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getUnits();
        }
        subscription.unsubscribe();
      },
    });
  }
}
