import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { UsersService } from "./users.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { AuthService } from "src/app/utils/services/auth.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { UsersEditorComponent } from "./users-editor/users-editor.component";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { GridApi } from "ag-grid-community";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
})
export class UsersComponent implements OnInit {
  isLoading: boolean;
  gridApi: GridApi;
  onClose = new Subject<boolean>();
  isGetUsersCallComplete: boolean;
  gridRowDataUsers: any[] = [];
  rowCount: number = 0;
  defaultColDef = { resizable: true };

  search: {
    keyword: string;
    userRoleCode: string;
  } = {
    keyword: "",
    userRoleCode: undefined,
  };

  roles: { code: string; name: string }[] = [
    { code: "ADMIN", name: "Administrator" },
    { code: "MANAGER", name: "Property Manager" },
    { code: "STAFF", name: "Staff / Maintenance" },
    { code: "TENANT", name: "Tenant" },
  ];

  gridColumnDefsUsers = [
    {
      headerName: "Name",
      field: "name",
      width: 200,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      filter: true,
    },
    {
      headerName: "Email / Username",
      field: "email",
      width: 210,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Phone / Mobile",
      field: "phone",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Role",
      field: "userRoleCode",
      width: 160,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
      valueFormatter: (params) => {
        const roleMap: Record<string, string> = {
          ADMIN: "Administrator",
          MANAGER: "Property Manager",
          STAFF: "Staff / Maintenance",
          TENANT: "Tenant",
        };
        return roleMap[params.value] || params.value || "";
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 130,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Action",
      field: "Action",
      width: 120,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editUserModal.bind(this),
        onDelete: this.deleteUserModal.bind(this),
      },
    },
  ];

  constructor(
    public authService: AuthService,
    private title: Title,
    private usersService: UsersService,
    private toastrMessage: ToastrMessage,
    @Optional() public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.title.setTitle("Users | PMS");
    this.getUsers();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    if (this.gridRowDataUsers && this.gridRowDataUsers.length) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  onFilterChanged(params) {
    this.rowCount = params.api.getDisplayedRowCount();
  }

  getUsers() {
    this.isLoading = true;
    this.isGetUsersCallComplete = false;
    this.gridRowDataUsers = [];
    this.rowCount = 0;

    const params: any = {};
    if (this.search.keyword && this.search.keyword.trim()) {
      params.keyword = this.search.keyword.trim();
    }
    if (this.search.userRoleCode) {
      params.userRoleCode = this.search.userRoleCode;
    }

    this.usersService.getUsers(params).subscribe({
      next: (resultGetUsers) => {
        if (resultGetUsers && (resultGetUsers.users || []).length) {
          this.gridRowDataUsers = resultGetUsers.users;
          this.rowCount = this.gridRowDataUsers.length;
        } else if (Array.isArray(resultGetUsers)) {
          this.gridRowDataUsers = resultGetUsers;
          this.rowCount = this.gridRowDataUsers.length;
        }
        this.isLoading = false;
        this.isGetUsersCallComplete = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.isGetUsersCallComplete = true;
        this.errorHandlingService.errors(error);
      },
    });
  }

  addUserModal() {
    const bsModalRef = this.modalService.show(UsersEditorComponent, {
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
          this.getUsers();
        }
        subscription.unsubscribe();
      },
    });
  }

  editUserModal(data) {
    const bsModalRef = this.modalService.show(UsersEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        editUserId: data.id,
        formState: "EDIT",
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: boolean) => {
        if (result) {
          this.getUsers();
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteUserModal(data) {
    const userName = data.name;
    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the user <b>"${userName}"</b>?`,
        name: userName,
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.usersService.delete(data.id).subscribe({
            next: () => {
              this.getUsers();
              this.toastrMessage.showSuccessMessage(
                "User Deleted Successfully"
              );
            },
            error: (error) => {
              this.isLoading = false;
              this.errorHandlingService.errors(error);
            },
          });
        }
        subscription.unsubscribe();
      },
    });
  }
}
