import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { PatientTitleService } from "./patient-title.service";
import { PatientTitleEditorComponent } from "./patient-title-editor/patient-title-editor.component";

@Component({
  selector: "app-patient-title",
  templateUrl: "./patient-title.component.html",
})
export class PatientTitleComponent implements OnInit {
  rowData: any[] = [];
  columnDefs: any[] = [];
  isLoading = false;

  private modalRef?: BsModalRef;

  constructor(
    private patientTitlesService: PatientTitleService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.createColumnDefs();
    this.loadTitles();
  }

  createColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: "Title",
        field: "patienttitle",
        flex: 1,
      },
      {
        headerName: "Actions",
        width: 150,
        sortable: false,
        filter: false,
        cellRenderer: () =>
          `<button class="btn btn-sm btn-primary">Edit</button>
           <button class="btn btn-sm btn-danger ms-1">Delete</button>`,
      },
    ];
  }

  loadTitles(): void {
    this.isLoading = true;

    this.patientTitlesService.getAll().subscribe({
      next: (response: any) => {
        const titles = Array.isArray(response)
          ? response
          : response?.data?.patientTitles ??
            response?.data?.titles ??
            response?.patientTitles ??
            [];

        this.rowData = titles.map((item: any) => ({
          ...item,
          patienttitleid:
            item.patienttitleid ?? item.patientTitleID ?? item.patientTitleId,
          patienttitle: item.patienttitle ?? item.patientTitle ?? "",
          datachanged: item.datachanged ?? item.dataChanged ?? 0,
        }));
      },
      error: (error: any) => {
        console.error("Error loading Patient Titles:", error);
        alert("Unable to load Patient Titles.");
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onCellClicked(event: any): void {
    if (event.colDef.headerName !== "Actions") {
      return;
    }

    const target = event.event?.target as HTMLElement;
    const button = target?.closest("button");

    if (!button) {
      return;
    }

    const title = event.data;

    if (button.classList.contains("btn-primary")) {
      this.editTitle(title);
    } else if (button.classList.contains("btn-danger")) {
      this.deleteTitle(title);
    }
  }

  addTitle(): void {
    this.openEditor();
  }

  editTitle(title: any): void {
    this.openEditor(title);
  }

  private openEditor(title?: any): void {
    this.modalRef = this.modalService.show(PatientTitleEditorComponent, {
      class: "modal-lg",
      backdrop: "static",
      keyboard: false,
      initialState: {
        patientTitleEditId: title?.patienttitleid ?? null,
        patientTitleData: title ? { ...title } : null,
      },
    });

    const editor = this.modalRef.content as PatientTitleEditorComponent;

    editor.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.loadTitles();
      }
    });
  }

  deleteTitle(title: any): void {
    if (!confirm(`Delete Patient Title "${title.patienttitle}"?`)) {
      return;
    }

    this.patientTitlesService.delete(title.patienttitleid).subscribe({
      next: () => {
        alert("Patient Title deleted successfully.");
        this.loadTitles();
      },
      error: (error: any) => {
        console.error("Error deleting Patient Title:", error);
        alert("Unable to delete Patient Title.");
      },
    });
  }
}
