import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { UsersService } from "../users.service";
import { NgForm } from "@angular/forms";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-users-editor",
  templateUrl: "./users-editor.component.html",
})
export class UsersEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  formState: string;
  editUserId: number;
  onClose = new Subject<boolean>();
  showPassword: boolean = false;

  roles: { code: string; name: string }[] = [
    { code: "ADMIN", name: "Administrator" },
    { code: "MANAGER", name: "Property Manager" },
    { code: "STAFF", name: "Staff / Maintenance" },
    { code: "TENANT", name: "Tenant" },
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

  permissionSections = [
    {
      resource: "Dashboard",
      items: [
        {
          code: "PortfolioSummary",
          name: "Portfolio Summary",
          view: false,
        },
        {
          code: "RentCollected",
          name: "Rent Collected",
          view: false,
        },
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
        {
          code: "RecentReceipts",
          name: "Recent Receipts",
          view: false,
        },
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

  constructor(
    public bsModalRef: BsModalRef,
    private usersService: UsersService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.formState === "EDIT" && this.editUserId) {
      this.getUser(this.editUserId);
    }
  }

  onChangeRole() {
    if (this.user.userRoleCode === "ADMIN") {
      this.user.status = "Active";
    }
  }

  onClickShowPassword() {
    this.showPassword = !this.showPassword;
  }

  checkAllPermissionsSelected() {
    return this.activityKeys.every((activity) =>
      this.checkColumnSelected(activity.key)
    );
  }

  onSelectAllPermissions(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form?.form?.markAsDirty();
    this.permissionSections.forEach((section) => {
      section.items.forEach((item) => {
        this.activityKeys.forEach((activity) => {
          if (item[activity.key] !== undefined) {
            item[activity.key] = isChecked;
          }
        });
      });
    });
  }

  checkColumnSelected(field) {
    return this.permissionSections.every((section) =>
      section.items.every(
        (item) => item[field] === undefined || item[field] === true
      )
    );
  }

  onChangeColumnPermission(field: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form?.form?.markAsDirty();
    this.permissionSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item[field] !== undefined) {
          item[field] = isChecked;
          this.onChangePermission(item, field);
        }
      });
    });
  }

  onChangePermission(item, field: string) {
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

  getSelectedPermissions() {
    const allowedAppModules = [];
    const allowedAppActivities = [];

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

  handlePermissionSelection(allowedAppActivities = []) {
    this.permissionSections.forEach((section) => {
      section.items.forEach((item) => {
        this.activityKeys.forEach((activity) => {
          if (item[activity.key] !== undefined) {
            item[activity.key] = allowedAppActivities.includes(
              `${item.code}.${section.resource}.${activity.name}`
            );
          }
        });
      });
    });
  }

  save() {
    this.saveUser(true);
  }

  saveAndAddMore() {
    this.saveUser(false);
  }

  saveUser(closeTheModal: boolean) {
    let observable;
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

    if (this.formState === "EDIT") {
      observable = this.usersService.update(this.editUserId, params);
    } else if (this.formState === "NEW") {
      observable = this.usersService.create(params);
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
          this.form.resetForm({
            userRoleCode: "STAFF",
            status: "Active",
          });
          this.handlePermissionSelection([]);
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

  getUser(userId: number) {
    this.isLoading = true;
    this.usersService.getUser(userId).subscribe({
      next: (resultGetUser) => {
        const user =
          resultGetUser && resultGetUser.user
            ? resultGetUser.user
            : resultGetUser;
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
  onKeyEscape() {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form.dirty) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form.dirty) {
      this.cancelService.cancel(this.bsModalRef);
    }
  }
}
