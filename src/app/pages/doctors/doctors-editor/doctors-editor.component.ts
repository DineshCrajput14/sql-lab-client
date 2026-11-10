import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { DoctorsService } from "../doctors.service";
import { PropertiesService } from "src/app/pages/properties/properties.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";

@Component({
  selector: "app-doctors-editor",
  templateUrl: "./doctors-editor.component.html",
})
export class DoctorsEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;

  doctorname: string;
  paddress: string;
  description: string;
  caddress: string;
  phone: string;
  emailid: string;

  commissionpvalue: number;
  doctorEditId: number;

  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private doctorsService: DoctorsService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.formState === "EDIT" && this.doctorEditId) {
      this.editDoctor(this.doctorEditId);
    }
  }

  editDoctor(doctorId: number) {
    this.isLoading = true;

    this.doctorsService.getDoctor(doctorId).subscribe({
      next: (resultEditDoctor) => {
        const doctor =
          resultEditDoctor?.data?.doctor ??
          resultEditDoctor?.doctor ??
          resultEditDoctor?.data ??
          resultEditDoctor;

        if (doctor) {
          this.doctorname = doctor.doctorName ?? doctor.doctorname ?? "";

          this.paddress = doctor.pAddress ?? doctor.paddress ?? "";

          this.caddress = doctor.cAddress ?? doctor.caddress ?? "";

          this.phone = doctor.phone ?? "";

          this.emailid = doctor.emailId ?? doctor.emailid ?? "";

          this.commissionpvalue =
            doctor.commissionPvalue ?? doctor.commissionpvalue ?? 0;
        }

        this.isLoading = false;

        console.log("Edit Doctor Data:", doctor);
      },

      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  save(form: NgForm) {
    console.log("FORM SUBMITTED");
    console.log("Form valid:", form.valid);
    console.log("Form values:", form.value);
    console.log("Commission:", this.commissionpvalue);

    if (form.valid) {
      this.saveDoctor(true);
    }
  }
  // save() {
  //   this.saveDoctor(true);
  // }

  saveAndAddMore() {
    this.saveDoctor(false);
  }
  saveDoctor(closeTheModal: boolean) {
    console.log("Commission before save:", this.commissionpvalue);
    let observable;
    this.isLoading = true;
    this.dataChanged = true;
    const params = {
      doctorName: this.doctorname,
      pAddress: this.paddress || "",
      cAddress: this.caddress || "",
      emailId: this.emailid || "",
      phone: this.phone || "",
      commissionPvalue: this.commissionpvalue ?? null,
    };
    console.log("Doctor request params:", params);
    console.log("dddddd", params);
    if (this.formState === "EDIT") {
      observable = this.doctorsService.update(this.doctorEditId, params);
    } else if (this.formState === "NEW") {
      observable = this.doctorsService.create(params);
    }

    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();
          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("Doctor Added");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("Doctor Updated");
          }
        } else {
          this.formState = "NEW";
          this.form.resetForm();
          this.toastrMessage.showSuccessMessage("Doctor Added");

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
