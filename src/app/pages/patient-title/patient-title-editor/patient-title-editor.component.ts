import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
import { PatientTitleService } from "../patient-title.service";

@Component({
  selector: "app-patient-title-editor",
  templateUrl: "./patient-title-editor.component.html",
})
export class PatientTitleEditorComponent implements OnInit {
  patientTitleEditId: number | null = null;
  patientTitleData: any = null;

  patienttitle = "";

  isLoading = false;
  saveAndAddMore = false;

  onClose: Subject<boolean> = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private patientTitlesService: PatientTitleService
  ) {}

  ngOnInit(): void {
    if (this.patientTitleData) {
      this.patienttitle =
        this.patientTitleData.patienttitle ??
        this.patientTitleData.patientTitle ??
        "";
    }
  }

  saveMore(form: NgForm): void {
    this.saveAndAddMore = true;
    this.save(form);
  }

  save(form: NgForm): void {
    if (form.invalid || this.isLoading) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    const data = {
      patienttitle: this.patienttitle.trim(),
    };

    if (!data.patienttitle) {
      alert("Patient Title is required.");
      return;
    }

    this.isLoading = true;

    const isEdit = !!this.patientTitleEditId;

    const request = isEdit
      ? this.patientTitlesService.update(
          this.patientTitleEditId as number,
          data
        )
      : this.patientTitlesService.create(data);

    request.subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (isEdit) {
          alert(response?.message || "Patient Title updated successfully.");

          this.onClose.next(true);
          this.onClose.complete();
          this.bsModalRef.hide();
          return;
        }

        alert(response?.message || "Patient Title added successfully.");

        this.onClose.next(true);

        if (this.saveAndAddMore) {
          this.patienttitle = "";
          this.saveAndAddMore = false;

          form.resetForm({
            patienttitle: "",
          });

          return;
        }

        this.onClose.complete();
        this.bsModalRef.hide();
      },

      error: (error: any) => {
        console.error("Error saving Patient Title:", error);
        console.error("HTTP Status:", error.status);
        console.error("Backend response:", error.error);

        this.isLoading = false;
        this.saveAndAddMore = false;

        const message =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          "Unable to save Patient Title.";

        alert(message);
      },
    });
  }

  close(): void {
    console.log("CLOSE BUTTON CLICKED");
    this.onClose.next(false);
    this.onClose.complete();
    this.bsModalRef.hide();
  }
}
