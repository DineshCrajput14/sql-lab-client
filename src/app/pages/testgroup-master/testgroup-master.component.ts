import { Component, OnInit, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject, forkJoin } from "rxjs";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";
import { GroupMasterService } from "./testgroup-master.service";
import { TestGroupEditorComponent } from "./testgroup-editor/testgroup-editor.component";

@Component({
  selector: "app-testgroup-master",
  templateUrl: "./testgroup-master.component.html",
})
export class TestGroupMasterComponent implements OnInit {
  isGroupSelected = false;
  isLoading = false;
  gridApi: any;
  gridRowDataGroups: any[] = [];
  rowCount = 0;
  onClose = new Subject<boolean>();
  defaultColDef = { resizable: true };

  gridColumnDefsGroups = [
    {
      headerName: "Group Name",
      field: "groupName",
      flex: 1,
      minWidth: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Description",
      field: "description",
      flex: 1,
      minWidth: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Parent Group",
      field: "parentGroupName",
      flex: 1,
      minWidth: 180,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Order No",
      field: "orderNo",
      width: 110,
      sortable: true,
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
        // onEdit: this.editGroupModal.bind(this),
        // onDelete: this.deleteGroupModal.bind(this),
        onEdit: (data: any) => this.editGroupModal(data),
        onDelete: (data: any) => this.deleteGroupModal(data),
      },
    },
  ];

  constructor(
    private title: Title,
    private toastrMessage: ToastrMessage,
    private groupService: GroupMasterService,
    @Optional() public bsModalRef: BsModalRef,
    public authService: AuthService,
    private modalService: BsModalService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Group Master | LABS");
    this.getGroups();
  }

  getGroups(): void {
    this.isLoading = true;
    this.groupService.getGroups().subscribe({
      next: (result: any) => {
        const groups = result?.data?.groups ?? result?.groups ?? [];

        this.gridRowDataGroups = groups
          .map((g: any) => ({
            ...g,
            groupId: Number(g.groupId ?? g.groupid ?? g.id),
            groupName: g.groupName ?? g.groupname ?? "",
            description: g.description ?? "",
            parentId: Number(g.parentId ?? g.parentid ?? 0),
            parentGroupName: g.parentGroupName ?? g.parentgroupname ?? "",
            orderNo: Number(g.orderNo ?? g.orderno ?? 0),
            disabledInNewTran: Number(
              g.disabledInNewTran ?? g.disabledinnewtran ?? 0
            ),
            resource: "Masters",
            module: "PMS",
          }))
          .sort((a: any, b: any) => a.orderNo - b.orderNo);

        this.gridRowDataGroups.forEach((row: any, index: number) => {
          row.rowNo = index + 1;
        });

        this.rowCount = this.gridRowDataGroups.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorHandlingService.errors(err);
      },
    });
  }

  get selectedGroupIndex(): number {
    if (!this.gridApi) {
      return -1;
    }

    const selectedRows = this.gridApi.getSelectedRows();

    if (!selectedRows?.length) {
      return -1;
    }

    return this.gridRowDataGroups.findIndex(
      (row: any) => row.groupId === selectedRows[0].groupId
    );
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;

    this.gridApi.addEventListener("selectionChanged", () => {
      setTimeout(() => {
        this.isGroupSelected = this.gridApi.getSelectedRows().length > 0;
      });
    });
  }

  onFilterChanged(params: any): void {
    this.rowCount = params.api?.getDisplayedRowCount();
  }

  newGroupModal(): void {
    const modal = this.modalService.show(TestGroupEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: { formState: "NEW" },
    });

    const subscription = modal.content.onClose.subscribe((result: boolean) => {
      if (result) this.getGroups();
      subscription.unsubscribe();
    });
  }

  editGroupModal(data: any): void {
    const groupId = Number(data.groupId ?? data.groupId);
    console.log("data=", data);
    if (!groupId) {
      this.toastrMessage.showErrorMessage("Group ID not found");
      return;
    }

    const modal = this.modalService.show(TestGroupEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: { groupEditId: groupId, formState: "EDIT" },
    });

    const subscription = modal.content.onClose.subscribe((result: boolean) => {
      if (result) this.getGroups();
      subscription.unsubscribe();
    });
  }

  deleteGroupModal(data: any): void {
    console.log("DELETE GROUP EVENT FIRED:", data);

    const groupId = Number(data.groupId ?? data.groupid ?? data.id);
    const name = data.groupName ?? data.groupname ?? "";

    if (!groupId || !name) {
      console.log("Invalid Group ID or Name:", { groupId, name });
      return;
    }

    if (this.gridRowDataGroups.some((g) => Number(g.parentId) === groupId)) {
      this.toastrMessage.showErrorMessage(
        "This group has child groups. Reassign them before deleting."
      );
      return;
    }

    const modal = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the group <b>"${name}"</b>?`,
        name,
      },
    });

    const subscription = modal.content.onClose.subscribe(
      (confirmed: boolean) => {
        console.log("DELETE CONFIRMED:", confirmed);

        if (confirmed) {
          this.groupService.delete(groupId).subscribe({
            next: () => {
              this.toastrMessage.showSuccessMessage(
                "Group Deleted Successfully"
              );
              this.getGroups();
            },
            error: (err) => this.errorHandlingService.errors(err),
          });
        }

        subscription.unsubscribe();
      }
    );
  }

  moveGroup(direction: "up" | "down"): void {
    if (!this.gridApi) {
      return;
    }

    const selectedRows = this.gridApi.getSelectedRows();

    if (!selectedRows || selectedRows.length === 0) {
      this.toastrMessage.showErrorMessage("Please select a record");
      return;
    }

    const selectedGroupId = Number(selectedRows[0].groupId);

    const rows = [...this.gridRowDataGroups];

    const currentIndex = rows.findIndex(
      (row: any) => Number(row.groupId) === selectedGroupId
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Stop at the top or bottom
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }

    // Move selected row one position
    [rows[currentIndex], rows[targetIndex]] = [
      rows[targetIndex],
      rows[currentIndex],
    ];

    // Update rowNo and orderNo
    rows.forEach((row: any, index: number) => {
      row.rowNo = index + 1;
      row.orderNo = index + 1;
    });

    // Prepare data for database update
    const groups = rows.map((row: any) => ({
      groupId: Number(row.groupId),
      orderNo: Number(row.orderNo),
    }));

    // this.isLoading = true;

    // Update order in database first
    this.groupService.updateGroupOrder(groups).subscribe({
      next: (response: any) => {
        // this.isLoading = false;

        // Update grid only after successful database update
        this.gridRowDataGroups = rows;
        this.gridApi.setRowData(rows);

        // Restore selection to the same group
        setTimeout(() => {
          this.gridApi.forEachNode((node: any) => {
            node.setSelected(Number(node.data?.groupId) === selectedGroupId);
          });
        });

        this.toastrMessage.showSuccessMessage(
          "Group order updated successfully"
        );
      },

      error: (err: any) => {
        this.isLoading = false;

        this.errorHandlingService.errors(err);
      },
    });
  }

  exit(): void {
    if (this.bsModalRef) this.bsModalRef.hide();
  }
}
