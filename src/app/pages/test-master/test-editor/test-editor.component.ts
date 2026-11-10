import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
import { TestMasterService } from "../test-master.service";

@Component({
  selector: "app-test-editor",
  templateUrl: "./test-editor.component.html",
})
export class TestEditorComponent implements OnInit {
  testEditId: number | null = null;
  testData: any = null;

  // Test Groups
  testGroups: any[] = [];

  // Test Details
  testname = "";
  testprice: number | string = 0;
  groupid: number | null = null;

  // Male Normal Range
  normalMinM: number | string | null = null;
  normalMaxM: number | string | null = null;
  normalUnitM = "";
  normalvaluem = "";

  // Female Normal Range
  normalMinF: number | string | null = null;
  normalMaxF: number | string | null = null;
  normalUnitF = "";
  normalvaluef = "";

  // Other Fields
  prnbold = false;
  orderno = 0;
  disabledinnewtran = false;

  isLoading = false;

  onClose: Subject<boolean> = new Subject<boolean>();

  constructor(
    public bsModalRef: BsModalRef,
    private testMasterService: TestMasterService
  ) {}

  ngOnInit(): void {
    this.loadTestGroups();

    if (this.testData) {
      // Test Name
      this.testname = this.testData.testName ?? this.testData.testname ?? "";

      // Test Price
      this.testprice = this.testData.testPrice ?? this.testData.testprice ?? 0;

      // Test Group
      this.groupid = this.testData.groupId ?? this.testData.groupid ?? null;

      // Male Minimum and Maximum
      this.normalMinM =
        this.testData.normalMinM ?? this.testData.normalminm ?? null;

      this.normalMaxM =
        this.testData.normalMaxM ?? this.testData.normalmaxm ?? null;

      // Male Unit
      this.normalUnitM =
        this.testData.normalUnitM ?? this.testData.normalunitm ?? "";

      // Female Minimum and Maximum
      this.normalMinF =
        this.testData.normalMinF ?? this.testData.normalminf ?? null;

      this.normalMaxF =
        this.testData.normalMaxF ?? this.testData.normalmaxf ?? null;

      // Female Unit
      this.normalUnitF =
        this.testData.normalUnitF ?? this.testData.normalunitf ?? "";

      // Existing Normal Values
      this.normalvaluem =
        this.testData.normalValueM ?? this.testData.normalvaluem ?? "";

      this.normalvaluef =
        this.testData.normalValueF ?? this.testData.normalvaluef ?? "";

      // Generate Male Range
      if (
        this.normalMinM !== null ||
        this.normalMaxM !== null ||
        this.normalUnitM !== ""
      ) {
        this.generateMaleRange();
      }

      // Generate Female Range
      if (
        this.normalMinF !== null ||
        this.normalMaxF !== null ||
        this.normalUnitF !== ""
      ) {
        this.generateFemaleRange();
      }

      // Print Bold
      this.prnbold = !!(this.testData.prnBold ?? this.testData.prnbold);

      // Order No
      this.orderno = Number(
        this.testData.orderNo ?? this.testData.orderno ?? 0
      );

      // Disabled in New Transaction
      this.disabledinnewtran = !!(
        this.testData.disabledInNewTran ?? this.testData.disabledinnewtran
      );
    } else {
      // New Test
      this.testprice = 0;
      this.orderno = 0;
    }
  }

  // Load Test Groups
  loadTestGroups(): void {
    this.testMasterService.getTestGroups().subscribe({
      next: (response: any) => {
        const groups = Array.isArray(response)
          ? response
          : response?.data?.testGroups ??
            response?.data?.groups ??
            response?.testGroups ??
            response?.groups ??
            [];

        // Group ID 1 should not appear in the dropdown.
        this.testGroups = groups
          .filter((group: any) => {
            const id = group.groupId ?? group.groupid ?? group.id;
            return Number(id) !== 1;
          })
          .map((group: any) => ({
            ...group,
            groupId: Number(group.groupId ?? group.groupid ?? group.id),
            groupName: group.groupName ?? group.groupname ?? group.name ?? "",
          }));
      },
      error: (error: any) => {
        console.error("Error loading Test Groups:", error);
        alert("Unable to load Test Groups.");
      },
    });
  }

  // Generate Male Normal Range
  generateMaleRange(): void {
    this.normalvaluem = this.buildRange(
      this.normalMinM,
      this.normalMaxM,
      this.normalUnitM
    );
  }

  // Generate Female Normal Range
  generateFemaleRange(): void {
    this.normalvaluef = this.buildRange(
      this.normalMinF,
      this.normalMaxF,
      this.normalUnitF
    );
  }

  // Build Normal Range with Unit
  private buildRange(
    min: number | string | null,
    max: number | string | null,
    unit: string
  ): string {
    const minValue = this.formatRangeValue(min);
    const maxValue = this.formatRangeValue(max);
    const unitValue = (unit ?? "").trim();

    let range = "";

    if (minValue !== "" && maxValue !== "") {
      range = `${minValue}-${maxValue}`;
    } else if (minValue !== "") {
      range = minValue;
    } else if (maxValue !== "") {
      range = maxValue;
    }

    if (range === "") {
      return unitValue ? `/ ${unitValue}` : "";
    }

    return unitValue ? `${range} / ${unitValue}` : range;
  }

  // Format Numeric Value
  private formatRangeValue(value: number | string | null): string {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const text = String(value).trim();

    if (text === "") {
      return "";
    }

    const numberValue = Number(text);

    if (!Number.isFinite(numberValue)) {
      return "";
    }

    return text;
  }

  // Save Test
  save(form: NgForm): void {
    if (form.invalid || this.isLoading) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    // Validate Test Price
    const price = Number(this.testprice);

    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid Test Price.");
      return;
    }

    // Regenerate ranges before saving.
    this.generateMaleRange();
    this.generateFemaleRange();

    const data = {
      testName: this.testname.trim(),

      // Test Price
      testPrice: price,

      groupId: this.groupid,

      // Male Normal Value
      normalMinM: this.normalMinM,
      normalMaxM: this.normalMaxM,
      normalUnitM: this.normalUnitM.trim(),
      normalValueM: this.normalvaluem,

      // Female Normal Value
      normalMinF: this.normalMinF,
      normalMaxF: this.normalMaxF,
      normalUnitF: this.normalUnitF.trim(),
      normalValueF: this.normalvaluef,

      // Other Fields
      prnBold: this.prnbold ? 1 : 0,
      orderNo: this.orderno,
      datachanged: this.testEditId ? 1 : 0,
      disabledInNewTran: this.disabledinnewtran ? 1 : 0,
    };

    this.isLoading = true;

    const request = this.testEditId
      ? this.testMasterService.update(this.testEditId, data)
      : this.testMasterService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;

        alert(
          this.testEditId
            ? "Test updated successfully."
            : "Test added successfully."
        );

        this.onClose.next(true);
        this.onClose.complete();

        this.bsModalRef.hide();
      },

      error: (error: any) => {
        console.error("SAVE TEST MASTER ERROR:", error);
        console.error("BACKEND ERROR BODY:", error?.error);

        const message =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          "Unable to Save Test Master";

        alert(message);
        this.isLoading = false;
      },
    });
  }

  // Close Modal
  close(): void {
    this.onClose.next(false);
    this.onClose.complete();
    this.bsModalRef.hide();
  }
}
