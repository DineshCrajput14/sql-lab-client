import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { AmenitiesService } from "./amenities.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { AmenitiesEditorComponent } from "./amenities-editor/amenities-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-amenities",
  templateUrl: "./amenities.component.html",
})
export class AmenitiesComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataAmenities = [];
  rowCount: number = 0;

  gridColumnDefsAmenities = [
    {
      headerName: "Amenities Name",
      field: "name",
      width: 240,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Type",
      field: "type",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Charge Type",
      field: "chargeType",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Default Charge",
      field: "defaultCharges",
      width: 180,
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
        onEdit: this.editAmenityModal.bind(this),
        onDelete: this.deleteAmenityModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private amenitiesService: AmenitiesService,
    private toastrMessage: ToastrMessage,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Amenities | PMS");
    this.getAmenities();
  }

  getAmenities() {
    this.isLoading = true;
    this.gridRowDataAmenities = [];
    this.rowCount = 0;
    this.amenitiesService.getAmenities().subscribe({
      next: (resultGetAmenities) => {
        if (resultGetAmenities && (resultGetAmenities.amenities || []).length) {
          this.gridRowDataAmenities = resultGetAmenities.amenities.map(
            (amenity) => ({
              ...amenity,
            })
          );
          this.rowCount = this.gridRowDataAmenities.length;
        }
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

  editAmenityModal(data) {
    const bsModalRef = this.modalService.show(AmenitiesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        editAmenityId: data.id,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getAmenities();
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteAmenityModal(data) {
    let name: string;
    this.gridRowDataAmenities.find((amenity) => {
      if (amenity.id === data.id) {
        name = amenity.name;
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
        message: `Do you want to remove the amenity <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.amenitiesService.delete(data.id).subscribe({
            next: () => {
              this.getAmenities();
              this.toastrMessage.showSuccessMessage(
                "Amenity Deleted Successfully"
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

  newAmenityModal() {
    const bsModalRef = this.modalService.show(AmenitiesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        formState: "NEW",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getAmenities();
        }
        subscription.unsubscribe();
      },
    });
  }
}
