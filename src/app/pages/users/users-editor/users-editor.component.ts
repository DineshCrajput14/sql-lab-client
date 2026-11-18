import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { UsersService } from "../users.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-users-editor",
  templateUrl: "./users-editor.component.html",
})
export class UsersEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  isLoading = false;
  dataChanged = false;
  formState: string;
  editUserId: number;
  onClose = new Subject<boolean>();
  showPassword = false;

  // Cached filtered permissions. No getter/change-detection recalculation.
  visiblePermissionSections: any[] = [];

  roles: { code: string; name: string }[] = [
    { code: "ADMIN", name: "Administrator" },
    { code: "MANAGER", name: "Manager" },
    { code: "STAFF", name: "Staff" },
    this.authService.isTenantManagement
      ? { code: "TENANT", name: "Tenant" }
      : { code: "PATIENT", name: "Patient" },
  ];

  statuses: string[] = ["Active", "Inactive"];

  user: {
    name: string;
    email: string;
    phone: string;
    userRoleCode: string;
    password?: string;
    status: string;
  } = {
    name: "",
    email: "",
    phone: "",
    userRoleCode: "STAFF",
    password: "",
    status: "Active",
  };

  activityKeys = [
    { key: "createNew", name: "CreateNew", label: "New" },
    { key: "edit", name: "Edit", label: "Edit" },
    { key: "delete", name: "Delete", label: "Delete" },
    { key: "view", name: "View", label: "View" },
    { key: "print", name: "Print", label: "Print" },
  ];

  // Original permission list. Always use this for saving/restoring.
  permissionSections = [
    {
      resource: "Dashboard",
      items: [
        { code: "PortfolioSummary", name: "Portfolio Summary", view: false },
        { code: "RentCollected", name: "Rent Collected", view: false },
        {
          code: "OccupancyDistribution",
          name: "Occupancy Distribution",
          view: false,
        },
        {
          code: "FinancialPerformance",
          name: "Financial Performance",
          view: false,
        },
        { code: "RecentReceipts", name: "Recent Receipts", view: false },
      ],
    },
    {
      resource: "Masters",
      items: [
        {
          code: "PMS",
          name: "PMS",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
        {
          code: "LAB",
          name: "LAB",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
        {
          code: "Miscellaneous",
          name: "Miscellaneous",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
      ],
    },
    {
      resource: "Transactions",
      items: [
        {
          code: "LabTest",
          name: "Lab Test",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
        {
          code: "TenantRegistration",
          name: "Tenant Registration",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
        {
          code: "RoomsAllotment",
          name: "Rooms Allotment",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
        },
        {
          code: "Receipt",
          name: "Receipt",
          createNew: false,
          edit: false,
          delete: false,
          view: false,
          print: false,
        },
      ],
    },
    {
      resource: "Reports",
      items: [
        {
          code: "PatientRegister",
          name: "Patient Register",
          view: false,
          print: false,
        },
        {
          code: "DoctorSummary",
          name: "Doctor Summary",
          view: false,
          print: false,
        },
        {
          code: "RegistrationReports",
          name: "Registration Reports",
          view: false,
          print: false,
        },
        {
          code: "OutstandingReports",
          name: "Outstanding Reports",
          view: false,
        },
        {
          code: "OccupancyStatus",
          name: "Occupancy Status",
          view: false,
        },
        {
          code: "AgreementExpiry",
          name: "Agreement Expiry",
          view: false,
        },
      ],
    },
  ];

  private readonly tenantManagementPermissions = [
    // Dashboard
    "PortfolioSummary",
    "RentCollected",
    "OccupancyDistribution",
    "FinancialPerformance",
    "RecentReceipts",

    // Masters
    "PMS",

    // Transactions
    "TenantRegistration",
    "RoomsAllotment",
    "Receipt",

    // Reports
    "OutstandingReports",
    "OccupancyStatus",
    "AgreementExpiry",
    "RegistrationReports",
  ];

  constructor(
    public bsModalRef: BsModalRef,
    private usersService: UsersService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setVisiblePermissionSections();

    if (this.formState === "EDIT" && this.editUserId) {
      this.getUser(this.editUserId);
    }
  }

  // Calculate visible permissions only when required.
  setVisiblePermissionSections(): void {
    const isTenantManagement = this.authService.isTenantManagement === true;

    this.visiblePermissionSections = this.permissionSections
      .map((section) => ({
        resource: section.resource,
        items: section.items.filter((item) => {
          const isTenantPermission = this.tenantManagementPermissions.includes(
            item.code
          );

          return isTenantManagement ? isTenantPermission : !isTenantPermission;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }

  onChangeRole(): void {
    if (this.user.userRoleCode === "ADMIN") {
      this.user.status = "Active";
    }
  }

  onClickShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  checkAllPermissionsSelected(): boolean {
    return this.activityKeys.every((activity) =>
      this.checkColumnSelected(activity.key)
    );
  }

  onSelectAllPermissions(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    this.form?.form?.markAsDirty();

    this.visiblePermissionSections.forEach((section) => {
      section.items.forEach((item) => {
        this.activityKeys.forEach((activity) => {
          if (item[activity.key] !== undefined) {
            item[activity.key] = isChecked;
          }
        });
      });
    });
  }

  checkColumnSelected(field: string): boolean {
    return this.visiblePermissionSections.every((section) =>
      section.items.every(
        (item) => item[field] === undefined || item[field] === true
      )
    );
  }

  onChangeColumnPermission(field: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    this.form?.form?.markAsDirty();

    this.visiblePermissionSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item[field] !== undefined) {
          item[field] = isChecked;
          this.onChangePermission(item, field);
        }
      });
    });
  }

  onChangePermission(item: any, field: string): void {
    if (field !== "view" && item[field]) {
      item.view = true;
    } else if (field === "view" && !item.view) {
      this.activityKeys.forEach((activity) => {
        if (item[activity.key] !== undefined) {
          item[activity.key] = false;
        }
      });
    }
  }

  // Save permissions from ALL sections, including hidden ones.
  getSelectedPermissions(): {
    allowedAppModules: string[];
    allowedAppActivities: string[];
  } {
    const allowedAppModules: string[] = [];
    const allowedAppActivities: string[] = [];

    this.permissionSections.forEach((section) => {
      section.items.forEach((item) => {
        this.activityKeys.forEach((activity) => {
          if (item[activity.key]) {
            if (!allowedAppModules.includes(item.code)) {
              allowedAppModules.push(item.code);
            }

            allowedAppActivities.push(
              `${item.code}.${section.resource}.${activity.name}`
            );
          }
        });
      });
    });

    return { allowedAppModules, allowedAppActivities };
  }

  // Restore permissions from ALL sections.
  handlePermissionSelection(allowedAppActivities: any = []): void {
    const activities = Array.isArray(allowedAppActivities)
      ? allowedAppActivities
      : [];

    this.permissionSections.forEach((section) => {
      section.items.forEach((item) => {
        this.activityKeys.forEach((activity) => {
          if (item[activity.key] !== undefined) {
            item[activity.key] = activities.includes(
              `${item.code}.${section.resource}.${activity.name}`
            );
          }
        });
      });
    });
  }

  save(): void {
    this.saveUser(true);
  }

  saveAndAddMore(): void {
    this.saveUser(false);
  }

  saveUser(closeTheModal: boolean): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.dataChanged = true;

    if (this.user.userRoleCode === "ADMIN") {
      this.user.status = "Active";
    }

    const {
      allowedAppModules,
      allowedAppActivities,
    } = this.getSelectedPermissions();

    const params = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      userRoleCode: this.user.userRoleCode,
      status: this.user.status,
      password: this.user.password ? this.user.password.trim() : "",
      allowedAppModules,
      allowedAppActivities,
    };

    const observable =
      this.formState === "EDIT"
        ? this.usersService.update(this.editUserId, params)
        : this.formState === "NEW"
        ? this.usersService.create(params)
        : null;

    if (!observable) {
      this.isLoading = false;
      return;
    }

    observable.subscribe({
      next: () => {
        if (closeTheModal) {
          this.onClose.next(this.dataChanged);
          this.bsModalRef.hide();

          if (this.formState === "NEW") {
            this.toastrMessage.showSuccessMessage("User Added Successfully");
          } else if (this.formState === "EDIT") {
            this.toastrMessage.showSuccessMessage("User Updated Successfully");
          }
        } else {
          this.formState = "NEW";
          this.editUserId = null;

          this.user = {
            name: "",
            email: "",
            phone: "",
            userRoleCode: "STAFF",
            password: "",
            status: "Active",
          };

          this.handlePermissionSelection([]);
          this.showPassword = false;

          this.form?.resetForm(this.user);

          this.toastrMessage.showSuccessMessage("User Added Successfully");

          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getUser(userId: number): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.usersService.getUser(userId).subscribe({
      next: (resultGetUser) => {
        const user = resultGetUser?.user || resultGetUser;

        if (user) {
          this.user.name = user.name || "";
          this.user.email = user.email || "";
          this.user.phone = user.phone || "";
          this.user.userRoleCode = user.userRoleCode || "STAFF";
          this.user.status = user.status || "Active";
          this.user.password = user.password || "";

          this.handlePermissionSelection(user.allowedAppActivities || []);
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
  onKeyEscape(): void {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
  }

  cancel(): void {
    if (this.isLoading) {
      return;
    }

    if (!this.form?.dirty) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }

    this.cancelService.cancel(this.bsModalRef);
  }
}
