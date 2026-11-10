import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { TestMasterService } from "./test-master.service";
import { TestEditorComponent } from "./test-editor/test-editor.component";

@Component({
  selector: "app-test-master",
  templateUrl: "./test-master.component.html",
})
export class TestMasterComponent implements OnInit {
  rowData: any[] = [];
  columnDefs: any[] = [];

  testGroups: any[] = [];

  private allTests: any[] = [];

  selectedGroupId: string | number = "all";

  isLoading = false;

  private modalRef?: BsModalRef;

  constructor(
    private testMasterService: TestMasterService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.createColumnDefs();
    this.loadTestGroups();
    this.loadTests();
  }

  createColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: "Test Name",
        field: "testname",
        flex: 1,
      },
      {
        headerName: "Test Group",
        field: "groupName",
        flex: 1,
      },
      {
        headerName: "Male Normal Value",
        field: "normalvaluem",
        flex: 1,
      },
      {
        headerName: "Female Normal Value",
        field: "normalvaluef",
        flex: 1,
      },
      {
        headerName: "Print Bold",
        field: "prnbold",
        width: 120,
        valueFormatter: (params: any) => (params.value ? "Yes" : "No"),
      },
      {
        headerName: "Disabled",
        field: "disabledinnewtran",
        width: 120,
        valueFormatter: (params: any) => (params.value ? "Yes" : "No"),
      },
      {
        headerName: "Price",
        field: "testPrice",
        sortable: true,
        filter: "agNumberColumnFilter",
        width: 120,
        valueFormatter: (params: any) =>
          params.value != null ? Number(params.value).toFixed(2) : "0.00",
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

  loadTestGroups(): void {
    this.testMasterService.getTestGroups().subscribe({
      next: (response: any) => {
        const groups = Array.isArray(response)
          ? response
          : response?.data?.groups ?? response?.groups ?? [];

        this.testGroups = groups.map((group: any) => ({
          groupId: group.groupId ?? group.groupid ?? group.id,
          groupName: group.groupName ?? group.groupname ?? group.name ?? "",
        }));
      },
      error: (error: any) => {
        console.error("Error loading test groups:", error);
        this.testGroups = [];
      },
    });
  }

  loadTests(): void {
    this.isLoading = true;

    this.testMasterService.getTests().subscribe({
      next: (response: any) => {
        const tests = Array.isArray(response)
          ? response
          : response?.data?.testMaster ??
            response?.data?.tests ??
            response?.tests ??
            [];

        this.allTests = tests.map((item: any) => ({
          ...item,

          testid: item.testid ?? item.testId,
          testname: item.testname ?? item.testName,

          normalvaluem: item.normalvaluem ?? item.normalValueM ?? "",

          normalvaluef: item.normalvaluef ?? item.normalValueF ?? "",

          groupid: item.groupid ?? item.groupId,

          groupName: item.groupName ?? item.groupname ?? "",

          prnbold: item.prnbold ?? item.prnBold ?? false,

          orderno: item.orderno ?? item.orderNo ?? 0,

          disabledinnewtran:
            item.disabledinnewtran ?? item.disabledInNewTran ?? false,
        }));

        this.applyGroupFilter();
      },
      error: (error: any) => {
        console.error("Error loading tests:", error);
        alert("Unable to load Test Master.");
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onGroupChange(): void {
    this.applyGroupFilter();
  }

  private applyGroupFilter(): void {
    if (
      this.selectedGroupId === "all" ||
      this.selectedGroupId === null ||
      this.selectedGroupId === undefined
    ) {
      this.rowData = [...this.allTests];
      return;
    }

    const selectedId = Number(this.selectedGroupId);

    this.rowData = this.allTests.filter(
      (test: any) => Number(test.groupid) === selectedId
    );
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

    const test = event.data;

    if (button.classList.contains("btn-primary")) {
      this.editTest(test);
    } else if (button.classList.contains("btn-danger")) {
      this.deleteTest(test);
    }
  }

  addTest(): void {
    this.openEditor();
  }

  editTest(test: any): void {
    this.openEditor(test);
  }

  private openEditor(test?: any): void {
    this.modalRef = this.modalService.show(TestEditorComponent, {
      class: "modal-lg",
      backdrop: "static",
      keyboard: false,
      initialState: {
        testEditId: test?.testid ?? null,
        testData: test ? { ...test } : null,
      },
    });

    const editor = this.modalRef.content as TestEditorComponent;

    editor.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.loadTests();
      }
    });
  }

  deleteTest(test: any): void {
    if (!confirm(`Delete test "${test.testname}"?`)) {
      return;
    }

    this.testMasterService.delete(test.testid).subscribe({
      next: () => {
        alert("Test deleted successfully.");
        this.loadTests();
      },
      error: (error: any) => {
        console.error("Error deleting test:", error);

        const message =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          "Unable to delete test.";

        alert(message);
      },
    });
  }
}
