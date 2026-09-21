import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { BuildingsService } from "../buildings.service";
import { PropertiesService } from "src/app/pages/properties/properties.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";

@Component({
  selector: "app-buildings-editor",
  templateUrl: "./buildings-editor.component.html",
})
export class BuildingsEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;

  name: string;
  propertyId: number;
  propertyTypeId: number;
  totalFloors: number;
  description: string;

  buildingEditId: number;
  selectedPropertyId: number;

  properties: [];
  propertyTypes: [];

  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private buildingsService: BuildingsService,
    private propertiesService: PropertiesService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.selectedPropertyId) {
      this.propertyId = this.selectedPropertyId;
    }

    this.getProperties();
    this.getPropertyTypes();

    if (this.formState === "EDIT" && this.buildingEditId) {
      this.editBuilding(this.buildingEditId);
    }
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
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }
  getPropertyTypes() {
    this.isLoading = true;
    this.propertyTypes = [];
    this.buildingsService.getPropertyTypes().subscribe({
      next: (resultGetTypes) => {
        if (resultGetTypes && (resultGetTypes.propertyTypes || []).length) {
          this.propertyTypes = resultGetTypes.propertyTypes;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }
  editBuilding(buildingId: number) {
    this.isLoading = true;
    this.buildingsService.getBuilding(buildingId).subscribe({
      next: (resultEditBuilding) => {
        const building =
          resultEditBuilding && resultEditBuilding.building
            ? resultEditBuilding.building
            : resultEditBuilding;
        if (building) {
          this.name = building.name;
          this.propertyId = building.propertyId;
          this.propertyTypeId = building.propertyTypeId;
          this.totalFloors = building.totalFloors;
          this.description = building.description || "";
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
    this.saveBuilding(true);
  }
  saveAndAddMore() {
    this.saveBuilding(false);
  }
  saveBuilding(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      propertyId: this.propertyId,
      name: this.name,
      propertyTypeId: this.propertyTypeId,
      totalFloors: this.totalFloors,
      description: this.description || "",
    };

    if (this.formState === "EDIT") {
      observable = this.buildingsService.update(this.buildingEditId, params);
    } else if (this.formState === "NEW") {
      observable = this.buildingsService.create(params);
    }

    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Building Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Building Updated");
          }
        } else {
          let propertyIdTemp = this.propertyId;
          this.formState = "NEW";
          this.form.resetForm();
          this.toastrMessage.showSuccessMessage("Building Added");
          this.propertyId = propertyIdTemp;
          this.form.form.patchValue({
            property: propertyIdTemp,
          });
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
