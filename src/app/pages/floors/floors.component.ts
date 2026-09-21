import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { FloorsService } from "./floors.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { FloorsEditorComponent } from "./floors-editor/floors-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-floors",
  templateUrl: "./floors.component.html",
})
export class FloorsComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataFloors = [];
  rowCount: number = 0;

  gridColumnDefsFloors = [
    {
      headerName: "Floor Name",
      field: "name",
      width: 280,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Floor No",
      field: "floorNo",
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
        onEdit: this.editFloorModal.bind(this),
        onDelete: this.deleteFloorModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private floorsService: FloorsService,
    private toastrMessage: ToastrMessage,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Floor | PMS");
    this.getFloors();
  }

  getFloors() {
    this.isLoading = true;
    this.gridRowDataFloors = [];
    this.rowCount = 0;
    this.floorsService.getFloors().subscribe({
      next: (resultGetFloors) => {
        if (resultGetFloors && (resultGetFloors.floors || []).length) {
          this.gridRowDataFloors = resultGetFloors.floors.map((floor) => ({
            ...floor,
          }));
          this.rowCount = this.gridRowDataFloors.length;
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

  editFloorModal(data) {
    const bsModalRef = this.modalService.show(FloorsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        editFloorId: data.id,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getFloors();
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteFloorModal(data) {
    let name: string;
    this.gridRowDataFloors.find((floor) => {
      if (floor.id === data.id) {
        name = floor.name;
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
        message: `Do you want to remove the floor <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.floorsService.delete(data.id).subscribe({
            next: () => {
              this.getFloors();
              this.toastrMessage.showSuccessMessage(
                "Floor Deleted Successfully"
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

  newFloorModal() {
    const bsModalRef = this.modalService.show(FloorsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        formState: "NEW",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getFloors();
        }
        subscription.unsubscribe();
      },
    });
  }
}
