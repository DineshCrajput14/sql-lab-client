import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { PropertiesService } from "./properties.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { PropertiesEditorComponent } from "./properties-editor/properties-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
})
export class PropertiesComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  isGetPropertiesCallComplete: boolean = false;
  gridRowDataProperties = [];
  rowCount: number = 0;

  gridColumnDefsProperties = [
    {
      headerName: "Property Name",
      field: "name",
      width: 250,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Address",
      field: "address",
      width: 250,
      sortable: true,
      filter: true,
    },
    {
      headerName: "City",
      field: "cityName",
      width: 180,
      sortable: true,
      filter: true,
    },
    {
      headerName: "State",
      field: "stateName",
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Owner",
      field: "ownerName",
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Action",
      field: "Action",
      width: 155,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editPropertyModal.bind(this),
        onDelete: this.deletePropertyModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private toastrMessage: ToastrMessage,
    private propertiesService: PropertiesService,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Properties | PMS");
    this.getProperties();
  }

  getProperties() {
    this.gridRowDataProperties = [];
    this.rowCount = 0;
    this.isLoading = true;
    this.isGetPropertiesCallComplete = false;
    this.propertiesService.getProperties().subscribe({
      next: (resultGetProperties) => {
        if (
          resultGetProperties &&
          (resultGetProperties.properties || []).length
        ) {
          this.gridRowDataProperties = resultGetProperties.properties.map(
            (propertie) => ({
              ...propertie,
            })
          );
          this.rowCount = this.gridRowDataProperties.length;
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

  editPropertyModal(data) {
    const bsModalRef = this.modalService.show(PropertiesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        propertyEditId: data.id,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getProperties();
        }
        subscription.unsubscribe();
      },
    });
  }

  newPropertyModal() {
    const bsModalRef = this.modalService.show(PropertiesEditorComponent, {
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
          this.getProperties();
        }
        subscription.unsubscribe();
      },
    });
  }

  deletePropertyModal(data) {
    let name: string;
    this.gridRowDataProperties.find((propertie) => {
      if (propertie.id === data.id) {
        name = propertie.name;
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
        message: `Do you want to remove the property <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.propertiesService.delete(data.id).subscribe({
            next: () => {
              this.getProperties();
              this.toastrMessage.showSuccessMessage(
                "Property Deleted Successfully"
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
