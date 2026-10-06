import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { UnitsService } from "../units.service";
import { FloorsService } from "../../floors/floors.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-units-editor",
  templateUrl: "./units-editor.component.html",
})
export class UnitsEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  floors;
  statuses: string[] = ["Available", "Occupied", "Maintenance/Reserved"];
  selectedPropertyId: number;
  selectedBuildingId: number;
  editUnitId: number;
  canEditStatus: boolean = true;
  statusReason: string = "";
  onClose = new Subject<boolean>();

  unit: {
    unitNo: string;
    floorId: number;
    status: string;
    charges: number;
    description: string;
  } = {
    unitNo: "",
    floorId: undefined,
    status: "Available",
    charges: 0,
    description: "",
  };

  constructor(
    public bsModalRef: BsModalRef,
    private unitsService: UnitsService,
    private floorsService: FloorsService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    this.getFloors();
    if (this.formState === "EDIT") {
      this.getUnit(this.editUnitId);
    }
  }

  getFloors() {
    this.floorsService.getFloors().subscribe({
      next: (resultGetFloors) => {
        if (resultGetFloors && (resultGetFloors.floors || []).length) {
          this.floors = resultGetFloors.floors;
          if (
            this.formState === "NEW" &&
            this.floors.length &&
            !this.unit.floorId
          ) {
            this.unit.floorId = this.floors[0].id;
          }
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  save() {
    this.saveUnit(true);
  }

  saveAndAddMore() {
    this.saveUnit(false);
  }

  saveUnit(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      propertyId: this.selectedPropertyId,
      buildingId: this.selectedBuildingId,
      unitNo: this.unit.unitNo,
      floorId: this.unit.floorId,
      status: this.unit.status,
      charges: this.unit.charges,
      description: this.unit.description,
    };
    if (this.formState === "EDIT") {
      observable = this.unitsService.update(this.editUnitId, params);
    } else if (this.formState === "NEW") {
      observable = this.unitsService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Unit Added Successfully");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Unit Updated Successfully");
          }
        } else {
          this.formState = "NEW";
          this.form.resetForm({
            floorId: this.floors.length ? this.floors[0].id : undefined,
            status: "Available",
            charges: 0,
          });
          this.toastrMessage.showSuccessMessage("Unit Added Successfully");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getUnit(unitId: number) {
    this.isLoading = true;
    this.unitsService.getUnit(unitId).subscribe({
      next: (resultGetUnit) => {
        if (resultGetUnit && resultGetUnit.unit) {
          this.unit.unitNo = resultGetUnit.unit.unitNo;
          this.unit.floorId = resultGetUnit.unit.floorId;
          this.unit.status = resultGetUnit.unit.status;
          this.unit.charges = resultGetUnit.unit.charges;
          this.unit.description = resultGetUnit.unit.description;
          this.canEditStatus = resultGetUnit.unit.canEditStatus !== false;
          this.statusReason = resultGetUnit.unit.statusReason || "";
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
