import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { GroupMasterService } from "../testgroup-master.service";

@Component({
  selector: "app-group-editor",
  templateUrl: "./testgroup-editor.component.html",
})
export class TestGroupEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  isLoading = false;
  dataChanged = false;
  formState: string;

  groupEditId: number;
  groupName = "";
  description = "";
  parentId = 0;
  orderNo = 0;
  disabledInNewTran = false;

  groups: any[] = [];
  onClose = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private groupService: GroupMasterService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;

    this.groupService.getGroups().subscribe({
      next: (result: any) => {
        const allGroups = result?.data?.groups ?? result?.groups ?? [];

        this.groups = allGroups
          .map((g: any) => ({
            groupId: Number(g.groupId ?? g.groupid ?? g.id),
            groupName: g.groupName ?? g.groupname ?? "",
            parentId: Number(g.parentId ?? g.parentid ?? 0),
          }))
          .filter((g: any) => g.groupId !== Number(this.groupEditId));

        if (this.formState === "EDIT" && this.groupEditId) {
          this.editGroup(this.groupEditId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorHandlingService.errors(err);
      },
    });
  }

  editGroup(id: number): void {
    this.groupService.getGroup(id).subscribe({
      next: (result: any) => {
        const g =
          result?.data?.group ?? result?.group ?? result?.data ?? result;

        if (g) {
          this.groupName = g.groupName ?? g.groupname ?? "";
          this.description = g.description ?? "";
          this.parentId = Number(g.parentId ?? g.parentid ?? 0);
          this.orderNo = Number(g.orderNo ?? g.orderno ?? 0);
          this.disabledInNewTran = Boolean(
            Number(g.disabledInNewTran ?? g.disabledinnewtran ?? 0)
          );
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorHandlingService.errors(err);
      },
    });
  }

  save(form: NgForm): void {
    if (!form.valid) return;
    this.saveGroup(true);
  }

  saveAndAddMore(): void {
    this.saveGroup(false);
  }

  saveGroup(closeTheModal: boolean): void {
    if (!this.groupName.trim()) {
      this.toastrMessage.showErrorMessage("Group name is required");
      return;
    }

    if (Number(this.parentId) === Number(this.groupEditId)) {
      this.toastrMessage.showErrorMessage("A group cannot be its own parent");
      return;
    }

    const params = {
      groupName: this.groupName.trim(),
      description: this.description || "",
      parentId: Number(this.parentId || 0),
      orderNo: Number(this.orderNo || 0),
      disabledInNewTran: this.disabledInNewTran ? 1 : 0,
    };

    this.isLoading = true;
    this.dataChanged = true;

    const request =
      this.formState === "EDIT"
        ? this.groupService.update(this.groupEditId, params)
        : this.groupService.create(params);

    request.subscribe({
      next: () => {
        if (closeTheModal) {
          this.toastrMessage.showSuccessMessage(
            this.formState === "EDIT" ? "Group Updated" : "Group Added"
          );
          this.onClose.next(true);
          this.bsModalRef.hide();
        } else {
          this.formState = "NEW";
          this.groupEditId = null;
          this.groupName = "";
          this.description = "";
          this.parentId = 0;
          this.orderNo = 0;
          this.disabledInNewTran = false;
          this.dataChanged = true;

          if (this.form) this.form.resetForm();

          this.isLoading = false;
          this.toastrMessage.showSuccessMessage("Group Added");
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.dataChanged = false;
        this.errorHandlingService.errors(err);
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
    if (this.isLoading) return;

    if (!this.form?.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }

    this.cancelService.cancel(this.bsModalRef);
  }
}
