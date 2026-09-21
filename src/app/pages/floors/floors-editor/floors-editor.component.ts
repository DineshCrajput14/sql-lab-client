import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FloorsService } from "../floors.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-floors-editor",
  templateUrl: "./floors-editor.component.html",
})
export class FloorsEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  floor: {
    name: string;
    floorNo: number;
  } = {
    name: "",
    floorNo: undefined,
  };
  editFloorId: number;
  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private floorsService: FloorsService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.formState === "EDIT") {
      this.getFloor(this.editFloorId);
    }
  }

  save() {
    this.saveFloor(true);
  }

  saveAndAddMore() {
    this.saveFloor(false);
  }

  saveFloor(closeTheModal: boolean) {
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      name: this.floor.name,
      floorNo: this.floor.floorNo,
    };
    if (this.formState === "EDIT") {
      observable = this.floorsService.update(this.editFloorId, params);
    } else if (this.formState === "NEW") {
      observable = this.floorsService.create(params);
    }
    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Floor Added Successfully");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Floor Updated Successfully");
          }
        } else {
          this.formState = "NEW";
          this.form.resetForm();
          this.toastrMessage.showSuccessMessage("Floor Added Successfully");
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getFloor(floorId: number) {
    this.isLoading = true;
    this.floorsService.getFloor(floorId).subscribe({
      next: (resultGetFloor) => {
        if (resultGetFloor && resultGetFloor.floor) {
          this.floor.name = resultGetFloor.floor.name;
          this.floor.floorNo = resultGetFloor.floor.floorNo;
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
