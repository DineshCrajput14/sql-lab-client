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
  showPassword: boolean = true;

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

  onRoleChange() {
    if (this.user.userRoleCode === "ADMIN") {
      this.user.status = "Active";
    }
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

    const params: any = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      userRoleCode: this.user.userRoleCode,
      status: this.user.status,
    };

    if (this.user.password && this.user.password.trim()) {
      params.password = this.user.password.trim();
    }

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
