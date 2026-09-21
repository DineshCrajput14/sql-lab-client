import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { CategoriesService } from "../categories.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-categories-editor",
  templateUrl: "./categories-editor.component.html",
})
export class CategoriesEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  category: {
    name: string;
  } = {
    name: "",
  };
  editCategoryId: number;
  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private categoriesService: CategoriesService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.formState === "EDIT") {
      this.getCategory(this.editCategoryId);
    }
  }

  save() {
    this.saveCategory(true);
  }

  saveAndAddMore() {
    this.saveCategory(false);
  }

  saveCategory(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      name: this.category.name,
    };
    if (this.formState === "EDIT") {
      observable = this.categoriesService.update(this.editCategoryId, params);
    } else if (this.formState === "NEW") {
      observable = this.categoriesService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Category Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Category Updated");
          }
        } else {
          this.formState = "NEW";
          this.form.resetForm();
          this.toastrMessage.showSuccessMessage("Category Added");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getCategory(categoryId: number) {
    this.isLoading = true;
    this.categoriesService.getCategory(categoryId).subscribe({
      next: (resultGetCategory) => {
        if (resultGetCategory && resultGetCategory.category) {
          this.category.name = resultGetCategory.category.name;
        }
        this.isLoading = false;
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
