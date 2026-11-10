import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { DoctorsService } from "./doctors.service";
import { PropertiesService } from "../properties/properties.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { DoctorsEditorComponent } from "./doctors-editor/doctors-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-doctors",
  templateUrl: "./doctors.component.html",
})
export class DoctorsComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  doctors = [];

  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };
  gridRowDataDoctors: any[] = [];
  rowCount: number = 0;

  gridColumnDefsDoctors = [
    {
      headerName: "Doctor Name",
      field: "doctorname",
      width: 220,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Address",
      field: "paddress",
      width: 200,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Phone",
      field: "phone",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },

    {
      headerName: "Action",
      field: "Action",
      width: 155,
      hide:
        !this.authService.findActivityPermission("PMS", "Masters", "Edit") &&
        !this.authService.findActivityPermission("PMS", "Masters", "Delete"),
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editDoctorModal.bind(this),
        onDelete: this.deleteDoctorModal.bind(this),
      },
    },
  ];

  constructor(
    private title: Title,
    private toastrMessage: ToastrMessage,
    private doctorsService: DoctorsService,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    console.log("ddddedddd");
    this.title.setTitle("Doctors | LABS");
    this.getDoctors();
  }

  // getDoctors() {
  //   this.gridRowDataDoctors = [];
  //   this.rowCount = 0;
  //   this.isLoading = true;
  //   console.log("hello");
  //   this.doctorsService.getDoctors().subscribe({
  //     next: (resultGetDoctors) => {
  //       if (resultGetDoctors && (resultGetDoctors.doctors || []).length) {
  //         this.gridRowDataDoctors = resultGetDoctors.doctors.map((doctor) => ({
  //           ...doctor,
  //           resource: "Masters",
  //           module: "PMS",
  //         }));
  //         this.rowCount = this.gridRowDataDoctors.length;
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.errorHandlingService.errors(err);
  //     },
  //   });
  // }

  getDoctors() {
    this.gridRowDataDoctors = [];
    this.rowCount = 0;
    this.isLoading = true;

    this.doctorsService.getDoctors().subscribe({
      next: (resultGetDoctors) => {
        const doctors =
          resultGetDoctors?.data?.doctors ?? resultGetDoctors?.doctors ?? [];

        this.gridRowDataDoctors = doctors.map((doctor: any) => ({
          ...doctor,

          // Normalize API fields for the existing grid
          id: doctor.doctorId ?? doctor.doctorid ?? doctor.id,
          doctorid: doctor.doctorId ?? doctor.doctorid ?? doctor.id,
          doctorname: doctor.doctorName ?? doctor.doctorname ?? "",
          paddress: doctor.pAddress ?? doctor.paddress ?? "",
          caddress: doctor.cAddress ?? doctor.caddress ?? "",
          phone: doctor.phone ?? "",
          emailid: doctor.emailId ?? doctor.emailid ?? "",
          commissionpvalue:
            doctor.commissionPValue ?? doctor.commissionpvalue ?? 0,

          resource: "Masters",
          module: "PMS",
        }));

        this.rowCount = this.gridRowDataDoctors.length;
        this.isLoading = false;

        console.log("Doctors Grid Data:", this.gridRowDataDoctors);
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

  // editDoctorModal(data) {
  //   const doctorId = data.doctorid ?? data.doctorId ?? data.id;

  //   if (!doctorId) {
  //     console.error("Doctor ID missing:", data);
  //     this.toastrMessage.showErrorMessage("Doctor ID not found");
  //     return;
  //   }

  //   const bsModalRef = this.modalService.show(DoctorsEditorComponent, {
  //     animated: true,
  //     backdrop: "static",
  //     keyboard: false,
  //     class: "modal-lg",
  //     initialState: {
  //       doctorEditId: data.doctorid,
  //       formState: "EDIT",
  //     },
  //   });
  //   const subscription = bsModalRef.content.onClose.subscribe({
  //     next: (result: boolean) => {
  //       if (result) {
  //         this.getDoctors();
  //       }
  //       subscription.unsubscribe();
  //     },
  //   });
  // }

  editDoctorModal(data: any) {
    const doctorId = data.doctorid ?? data.doctorId ?? data.id;

    if (!doctorId) {
      console.error("Doctor ID missing:", data);
      this.toastrMessage.showErrorMessage("Doctor ID not found");
      return;
    }

    const bsModalRef = this.modalService.show(DoctorsEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        doctorEditId: doctorId,
        formState: "EDIT",
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getDoctors();
        }
        subscription.unsubscribe();
      },
    });
  }

  newDoctorModal() {
    const bsModalRef = this.modalService.show(DoctorsEditorComponent, {
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
          this.getDoctors();
        }
        subscription.unsubscribe();
      },
    });
  }
  deleteDoctorModal(data) {
    let name: string;
    this.gridRowDataDoctors.find((doctor) => {
      if (doctor.id === data.id) {
        name = doctor.doctorname;
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
        message: `Do you want to remove the building <b> "${name}" </b>?`,
        name: name,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.doctorsService.delete(data.id).subscribe({
            next: () => {
              this.getDoctors();
              this.toastrMessage.showSuccessMessage(
                "Doctor Deleted Successfully"
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
