import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { CategoriesService } from "./categories.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { CategoriesEditorComponent } from "./categories-editor/categories-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
})
export class CategoriesComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataCategories = [];
  rowCount: number = 0;

  gridColumnDefsCategories = [
    {
      headerName: "Category Name",
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
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editCategoryModal.bind(this),
        onDelete: this.deleteCategoryModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private categoriesService: CategoriesService,
    private toastrMessage: ToastrMessage,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Categories | PMS");
    this.getCategories();
  }

  getCategories() {
    this.isLoading = true;
    this.gridRowDataCategories = [];
    this.rowCount = 0;
    this.categoriesService.getCategories().subscribe({
      next: (resultGetCategories) => {
        if (
          resultGetCategories &&
          (resultGetCategories.categories || []).length
        ) {
          this.gridRowDataCategories = resultGetCategories.categories.map(
            (category) => ({
              ...category,
            })
          );
          this.rowCount = this.gridRowDataCategories.length;
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

  editCategoryModal(data) {
    const bsModalRef = this.modalService.show(CategoriesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        editCategoryId: data.id,
        formState: "EDIT",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getCategories();
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteCategoryModal(data) {
    let name: string;
    this.gridRowDataCategories.find((category) => {
      if (category.id === data.id) {
        name = category.name;
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
        message: `Do you want to remove the category <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.categoriesService.delete(data.id).subscribe({
            next: () => {
              this.getCategories();
              this.toastrMessage.showSuccessMessage("Category Deleted");
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

  newCategoryModal() {
    const bsModalRef = this.modalService.show(CategoriesEditorComponent, {
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
          this.getCategories();
        }
        subscription.unsubscribe();
      },
    });
  }
}
