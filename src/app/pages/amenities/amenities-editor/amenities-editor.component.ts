import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AmenitiesService } from "../amenities.service";
import { CategoriesService } from "../../categories/categories.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-amenities-editor",
  templateUrl: "./amenities-editor.component.html",
})
export class AmenitiesEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  categories;
  types: string[] = ["Monthly", "One Time"];
  chargeTypes: string[] = ["Fixed"];
  editAmenityId: number;
  onClose = new Subject<boolean>();

  amenity: {
    name: string;
    categoryId: number;
    type: string;
    chargeType: string;
    defaultCharges: number;
    description: string;
  } = {
    name: "",
    categoryId: undefined,
    type: "Monthly",
    chargeType: "Fixed",
    defaultCharges: 0,
    description: "",
  };

  constructor(
    public bsModalRef: BsModalRef,
    private amenitiesService: AmenitiesService,
    private categoriesService: CategoriesService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    this.getCategories();
    if (this.formState === "EDIT") {
      this.getAmenity(this.editAmenityId);
    }
  }
  getCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (resultGetCategories) => {
        if (
          resultGetCategories &&
          (resultGetCategories.categories || []).length
        ) {
          this.categories = resultGetCategories.categories;
          if (
            this.formState === "NEW" &&
            this.categories.length &&
            !this.amenity.categoryId
          ) {
            this.amenity.categoryId = this.categories[0].id;
          }
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }
  save() {
    this.saveAmenity(true);
  }
  saveAndAddMore() {
    this.saveAmenity(false);
  }
  saveAmenity(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      name: this.amenity.name,
      categoryId: this.amenity.categoryId,
      type: this.amenity.type,
      chargeType: this.amenity.chargeType,
      defaultCharges: this.amenity.defaultCharges,
      description: this.amenity.description,
    };
    if (this.formState === "EDIT") {
      observable = this.amenitiesService.update(this.editAmenityId, params);
    } else if (this.formState === "NEW") {
      observable = this.amenitiesService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Amenity Added Successfully");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage(
              "Amenity Updated Successfully"
            );
          }
        } else {
          this.formState = "NEW";
          this.form.resetForm({
            categoryId: this.categories.length
              ? this.categories[0].id
              : undefined,
            type: "Monthly",
            chargeType: "Fixed",
            defaultCharges: 0,
          });
          this.toastrMessage.showSuccessMessage("Amenity Added Successfully");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }
  getAmenity(amenityId: number) {
    this.isLoading = true;
    this.amenitiesService.getAmenity(amenityId).subscribe({
      next: (resultGetAmenity) => {
        if (resultGetAmenity && resultGetAmenity.amenity) {
          this.amenity.name = resultGetAmenity.amenity.name;
          this.amenity.categoryId = resultGetAmenity.amenity.categoryId;
          this.amenity.type = resultGetAmenity.amenity.type;
          this.amenity.chargeType = resultGetAmenity.amenity.chargeType;
          this.amenity.defaultCharges = resultGetAmenity.amenity.defaultCharges;
          this.amenity.description = resultGetAmenity.amenity.description;
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
