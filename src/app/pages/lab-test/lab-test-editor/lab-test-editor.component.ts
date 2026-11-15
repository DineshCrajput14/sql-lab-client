import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
import { LabTestService } from "../lab-test.service";
import { SettingsService } from "../../../pages/settings/settings.service";

@Component({
  selector: "app-lab-test-editor",
  templateUrl: "./lab-test-editor.component.html",
})
export class LabTestEditorComponent implements OnInit {
  testtranid: number | null = null;
  labTestData: any = null;

  isLoading = false;
  saveAndAddMore = false;

  onClose: Subject<boolean> = new Subject<boolean>();

  patient = {
    serialno: null as number | null,
    date: this.getCurrentDateOnly(),

    samplereceivedon: this.getCurrentDateTime(),
    reportstatus: false,
    reportdate: "",
    finalpayment: false,

    titleid: null as number | null,
    patientname: "",
    fhname: "",
    refdoctor: "",
    age: "",
    agetime: "Year",
    gender: "Male",
    address1: "",
    address2: "",
    emailid: "",
    samplename: "",
    sampledrawnby: "",
    reportnumber: "",
    testtotal: 0,
    wtestvalue: 0,
    discp: 0,
    discAmount: 0,
    amount: 0,
    widaltest: false,
  };

  testGroups: any[] = [];
  availableTests: any[] = [];
  selectedTests: any[] = [];

  patientTitles: any[] = [];
  doctors: any[] = [];

  selectedGroupId: number | null = null;
  selectedAvailableTestIds: number[] = [];
  selectedTestIndex: number | null = null;

  subtotal = 0;

  private discountEntryMode: "percent" | "amount" = "percent";

  constructor(
    public bsModalRef: BsModalRef,
    private labTestService: LabTestService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadTestGroups();
    this.loadTests();
    this.loadPatientTitles();
    this.loadDoctors();

    if (this.labTestData) {
      // EDIT MODE
      // address2 is the database field. Do not use phoneno / phoneNo / phone.
      this.patient = {
        ...this.patient,
        ...this.labTestData,
        date: this.normalizeDateOnly(this.labTestData.date),
        address2:
          this.labTestData.address2 !== null &&
          this.labTestData.address2 !== undefined
            ? String(this.labTestData.address2)
            : "",
      };

      this.testtranid =
        Number(
          this.labTestData.testTranId ??
            this.labTestData.testtranid ??
            this.labTestData.id
        ) || null;

      // Normalize Report Status BIT value (0/1, boolean, or Buffer)
      this.patient.reportstatus = this.normalizeBitValue(
        this.labTestData.reportstatus
      );

      // Normalize Final Payment BIT value
      this.patient.finalpayment = this.normalizeBitValue(
        this.labTestData.finalpayment
      );

      // Date input expects YYYY-MM-DD format
      this.patient.samplereceivedon = this.normalizeDate(
        this.labTestData.samplereceivedon
      );

      this.patient.reportdate = this.normalizeDate(this.labTestData.reportdate);

      if (!this.patient.reportstatus) {
        this.patient.reportdate = "";
      }

      if (
        Array.isArray(this.labTestData.details) &&
        this.labTestData.details.length > 0
      ) {
        this.selectedTests = this.labTestData.details.map((test: any) => ({
          ...test,
          groupid: test.groupid ?? test.groupId,
          groupname: test.groupname ?? test.groupName,
          testid: test.testid ?? test.testId,
          testname: test.testname ?? test.testName,
          testprice:
            test.testprice ??
            test.testPrice ??
            test.price ??
            test.amount ??
            null,
          testvalue: test.testvalue ?? test.testValue ?? "",
        }));

        this.calculateTotals();
      } else if (this.testtranid) {
        this.loadExistingTestDetails(this.testtranid);
      }
    } else {
      // CREATE MODE
      this.testtranid = null;

      this.patient.reportstatus = false;
      this.patient.reportdate = "";
      this.patient.finalpayment = false;

      this.loadNextReferenceNo();
    }
  }

  // =========================
  // NORMALIZE BIT VALUE
  // =========================

  normalizeBitValue(value: any): boolean {
    if (value === true || value === 1 || value === "1") {
      return true;
    }

    if (value && typeof value === "object") {
      if (value instanceof Uint8Array) {
        return value[0] === 1;
      }

      if (value.data && Array.isArray(value.data)) {
        return value.data[0] === 1;
      }
    }

    return false;
  }

  // =========================
  // NORMALIZE DATE ONLY (date input)
  // =========================

  normalizeDateOnly(value: any): string {
    if (!value) {
      return "";
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    const dateString = String(value).trim().replace(" ", "T");
    return dateString.length >= 10 ? dateString.slice(0, 10) : dateString;
  }

  // =========================
  // NORMALIZE DATE (datetime-local)
  // =========================

  normalizeDate(value: any): string {
    if (!value) {
      return "";
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      const hours = String(value.getHours()).padStart(2, "0");
      const minutes = String(value.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const dateString = String(value).trim().replace(" ", "T");

    if (dateString.length >= 16) {
      return dateString.slice(0, 16);
    }

    if (dateString.length === 10) {
      return `${dateString}T00:00`;
    }

    return dateString;
  }

  // =========================
  // REPORT STATUS CHANGE
  // =========================

  onReportStatusChange(status: any): void {
    this.patient.reportstatus = this.normalizeBitValue(status);

    if (this.patient.reportstatus) {
      if (!this.patient.reportdate) {
        this.patient.reportdate = this.getCurrentDateTime();
      }
    } else {
      this.patient.reportdate = "";
    }
  }

  // =========================
  // LOAD EXISTING TEST DETAILS
  // =========================

  loadExistingTestDetails(id: number): void {
    this.isLoading = true;

    this.labTestService.getDetails(id).subscribe({
      next: (response: any) => {
        console.log("EXISTING TEST DETAILS:", response);

        const details = response?.data?.details ?? response?.details ?? [];

        this.selectedTests = details.map((test: any) => ({
          ...test,
          groupid: test.groupid ?? test.groupId,
          groupname: test.groupname ?? test.groupName,
          testid: test.testid ?? test.testId,
          testname: test.testname ?? test.testName,
          testprice:
            test.testprice ??
            test.testPrice ??
            test.price ??
            test.amount ??
            null,
          testvalue: test.testvalue ?? test.testValue ?? "",
        }));

        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Error loading existing test details:", error);
        this.isLoading = false;
      },
    });
  }

  // =========================
  // SELECT ALL TESTS CHECK
  // =========================

  isAllTestsSelected(): boolean {
    return (
      this.filteredTests.length > 0 &&
      this.filteredTests.every((test: any) =>
        this.selectedAvailableTestIds.includes(this.getTestId(test))
      )
    );
  }

  // =========================
  // LOAD TEST GROUPS
  // =========================

  loadTestGroups(): void {
    this.labTestService.getTestGroups().subscribe({
      next: (response: any) => {
        this.testGroups =
          response?.data?.groups || response?.groups || response?.data || [];

        this.testGroups = this.testGroups.filter(
          (group: any) =>
            (group.groupName ?? group.groupname ?? "").toLowerCase() !==
            "primary"
        );
      },
      error: (error: any) => {
        console.error("Error loading Test Groups:", error);
        alert("Unable to load Test Groups.");
      },
    });
  }

  // =========================
  // LOAD TEST MASTER
  // =========================

  loadTests(): void {
    this.labTestService.getTests().subscribe({
      next: (response: any) => {
        this.availableTests =
          response?.data?.tests || response?.tests || response?.data || [];

        this.calculateTotals();
      },
      error: (error: any) => {
        console.error("Error loading Tests:", error);
        alert("Unable to load Tests.");
      },
    });
  }

  // =========================
  // LOAD PATIENT TITLES
  // =========================

  loadPatientTitles(): void {
    this.labTestService.getPatientTitle().subscribe({
      next: (response: any) => {
        this.patientTitles = response?.data?.patientTitles || [];

        if (this.testtranid === null && this.patientTitles.length > 0) {
          this.patient.titleid = Number(this.patientTitles[0].patientTitleId);
        }

        console.log("Patient Titles:", this.patientTitles);
        console.log("Selected Title ID:", this.patient.titleid);
      },
      error: (error: any) => {
        console.error("Error loading Patient Titles:", error);
        this.patientTitles = [];
      },
    });
  }

  // =========================
  // LOAD DOCTORS
  // =========================

  loadDoctors(): void {
    this.labTestService.getDoctors().subscribe({
      next: (response: any) => {
        this.doctors =
          response?.data?.doctors ||
          response?.data?.doctor ||
          response?.doctors ||
          response?.doctor ||
          response?.data ||
          [];

        if (!this.labTestData && this.doctors.length > 0) {
          const first = this.doctors[0];
          const id = first.doctorid ?? first.doctorId;

          this.patient.refdoctor =
            id !== undefined && id !== null ? String(id) : "";
        }
      },
      error: (error: any) => {
        console.error("Error loading Doctors:", error);
      },
    });
  }

  // =========================
  // FILTER TESTS BY GROUP
  // =========================

  get filteredTests(): any[] {
    if (this.selectedGroupId === null || this.selectedGroupId === undefined) {
      return this.availableTests;
    }

    return this.availableTests.filter((test: any) => {
      return this.getGroupId(test) === Number(this.selectedGroupId);
    });
  }

  getGroupId(item: any): number {
    return Number(item.groupid ?? item.groupId ?? 0);
  }

  getTestId(item: any): number {
    return Number(item.testid ?? item.testId ?? 0);
  }

  getGroupName(item: any): string {
    return item.groupname ?? item.groupName ?? "";
  }

  getTestName(item: any): string {
    return item.testname ?? item.testName ?? "";
  }

  getTestPrice(item: any): number {
    const directPrice =
      item?.testprice ??
      item?.testPrice ??
      item?.price ??
      item?.amount ??
      item?.rate;

    if (
      directPrice !== null &&
      directPrice !== undefined &&
      directPrice !== ""
    ) {
      const price = Number(directPrice);
      return Number.isFinite(price) ? price : 0;
    }

    const testId = this.getTestId(item);

    const masterTest = this.availableTests.find(
      (test: any) => this.getTestId(test) === testId
    );

    const masterPrice =
      masterTest?.testprice ??
      masterTest?.testPrice ??
      masterTest?.price ??
      masterTest?.amount ??
      masterTest?.rate ??
      0;

    const price = Number(masterPrice);

    return Number.isFinite(price) ? price : 0;
  }

  // =========================
  // SELECT AVAILABLE TEST
  // =========================

  toggleAvailableTest(test: any, checked: boolean): void {
    const id = this.getTestId(test);

    if (checked) {
      if (!this.selectedAvailableTestIds.includes(id)) {
        this.selectedAvailableTestIds.push(id);
      }
    } else {
      this.selectedAvailableTestIds = this.selectedAvailableTestIds.filter(
        (item) => item !== id
      );
    }
  }

  selectAllTests(checked: boolean): void {
    this.selectedAvailableTestIds = checked
      ? this.filteredTests.map((test: any) => this.getTestId(test))
      : [];
  }

  // =========================
  // ADD TESTS
  // =========================

  addTests(): void {
    const testsToAdd = this.filteredTests.filter((test: any) =>
      this.selectedAvailableTestIds.includes(this.getTestId(test))
    );

    testsToAdd.forEach((test: any) => {
      const testId = this.getTestId(test);
      const groupId = this.getGroupId(test);

      const alreadyAdded = this.selectedTests.some(
        (item: any) => this.getTestId(item) === testId
      );

      if (alreadyAdded) {
        return;
      }

      const newTest = {
        masterid: test.masterid ?? test.masterId ?? null,
        groupid: groupId,
        groupname: this.getGroupName(test),
        groupName: this.getGroupName(test),
        testid: testId,
        testname: this.getTestName(test),
        testprice: this.getTestPrice(test),
        testvalue: "",
      };

      let lastGroupIndex = -1;

      for (let i = 0; i < this.selectedTests.length; i++) {
        if (this.getGroupId(this.selectedTests[i]) === groupId) {
          lastGroupIndex = i;
        }
      }

      if (lastGroupIndex !== -1) {
        this.selectedTests.splice(lastGroupIndex + 1, 0, newTest);
      } else {
        this.selectedTests.push(newTest);
      }
    });

    this.selectedAvailableTestIds = [];
    this.selectedTestIndex = null;

    this.calculateTotals();
  }

  // =========================
  // SELECT RIGHT SIDE TEST
  // =========================

  selectSelectedTest(index: number): void {
    this.selectedTestIndex = index;
  }

  // =========================
  // REMOVE TEST
  // =========================

  removeSelectedTest(): void {
    if (this.selectedTestIndex === null) {
      alert("Please select a test to remove.");
      return;
    }

    this.selectedTests.splice(this.selectedTestIndex, 1);
    this.selectedTestIndex = null;

    this.calculateTotals();
  }

  // =========================
  // EDIT GROUP
  // =========================

  editSelectedTest(): void {
    if (this.selectedTestIndex === null) {
      alert("Please select a test to edit.");
      return;
    }

    const selectedTest = this.selectedTests[this.selectedTestIndex];
    const groupId = this.getGroupId(selectedTest);

    this.selectedGroupId = groupId;

    const groupTestIds = this.selectedTests
      .filter((test: any) => this.getGroupId(test) === groupId)
      .map((test: any) => this.getTestId(test));

    this.selectedAvailableTestIds = [...groupTestIds];

    this.selectedTests = this.selectedTests.filter(
      (test: any) => this.getGroupId(test) !== groupId
    );

    this.selectedTestIndex = null;

    this.calculateTotals();
  }

  // =========================
  // DISCOUNT PERCENT CHANGE
  // =========================

  onDiscountPercentChange(): void {
    this.discountEntryMode = "percent";
    this.calculateTotals();
  }

  // =========================
  // DISCOUNT AMOUNT CHANGE
  // =========================

  onDiscountAmountChange(): void {
    this.discountEntryMode = "amount";
    this.calculateTotals();
  }

  // =========================
  // CALCULATE TOTALS
  // =========================

  calculateTotals(): void {
    const testTotal = (this.selectedTests || []).reduce(
      (total: number, test: any) => {
        return total + Number(this.getTestPrice(test) || 0);
      },
      0
    );

    this.patient.testtotal = Number(testTotal.toFixed(2));

    const widalValue = this.patient.widaltest
      ? Number(this.patient.wtestvalue || 0)
      : 0;

    this.subtotal = Number((this.patient.testtotal + widalValue).toFixed(2));

    if (this.discountEntryMode === "amount") {
      let discountAmount = Number(this.patient.discAmount || 0);

      if (!Number.isFinite(discountAmount)) {
        discountAmount = 0;
      }

      discountAmount = Math.max(0, Math.min(discountAmount, this.subtotal));

      this.patient.discAmount = Number(discountAmount.toFixed(2));

      this.patient.discp =
        this.subtotal > 0
          ? Number(((discountAmount / this.subtotal) * 100).toFixed(2))
          : 0;
    } else {
      let discountPercent = Number(this.patient.discp || 0);

      if (!Number.isFinite(discountPercent)) {
        discountPercent = 0;
      }

      discountPercent = Math.max(0, Math.min(discountPercent, 100));

      this.patient.discp = Number(discountPercent.toFixed(2));

      this.patient.discAmount = Number(
        ((this.subtotal * discountPercent) / 100).toFixed(2)
      );
    }

    this.patient.amount = Number(
      (this.subtotal - Number(this.patient.discAmount || 0)).toFixed(2)
    );
  }

  // =========================
  // SAVE AND ADD MORE
  // =========================

  saveMore(form: NgForm): void {
    this.saveAndAddMore = true;
    this.save(form);
  }

  // =========================
  // SAVE
  // =========================

  save(form: NgForm): void {
    if (form.invalid || this.isLoading) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    if (!this.patient.patientname?.trim()) {
      alert("Patient Name is required.");
      return;
    }

    if (this.selectedTests.length === 0) {
      alert("Please select at least one test.");
      return;
    }

    this.calculateTotals();

    this.isLoading = true;

    const titleId = this.patient.titleid ?? null;

    const payload = {
      ...this.patient,

      titleid: titleId,

      patientname: this.patient.patientname.trim(),

      // address2 remains address2 throughout the payload
      address2: this.patient.address2 ?? "",

      // Report status is stored as Yes/No BIT
      reportstatus: this.patient.reportstatus ? 1 : 0,

      // Final Payment is hidden from this editor.
      // New transaction default = No.
      finalpayment: this.patient.finalpayment ? 1 : 0,

      // Keep report date empty when status is No.
      reportdate: this.patient.reportstatus ? this.patient.reportdate : null,

      details: this.selectedTests.map((test: any) => ({
        masterid: this.testtranid,
        groupid: test.groupid ?? test.groupId,
        testid: test.testid ?? test.testId,
        testvalue: test.testvalue || "",
      })),
    };

    const isEditMode = this.testtranid !== null;

    const request = isEditMode
      ? this.labTestService.update(this.testtranid!, payload)
      : this.labTestService.create(payload);

    request.subscribe({
      next: (response: any) => {
        this.isLoading = false;

        alert(
          response?.message ||
            (isEditMode
              ? "Lab Test updated successfully."
              : "Lab Test saved successfully.")
        );

        this.onClose.next(true);
        this.onClose.complete();

        this.bsModalRef.hide();
      },

      error: (error: any) => {
        console.error("Error saving Lab Test:", error);
        console.error("Backend Error:", error?.error);

        this.isLoading = false;

        alert(
          error?.error?.message ||
            error?.message ||
            (isEditMode
              ? "Unable to update Lab Test."
              : "Unable to save Lab Test.")
        );
      },
    });
  }

  // =========================
  // CURRENT DATE TIME
  // =========================

  getCurrentDateTime1(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;

    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  }

  private getCurrentDateOnly(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // =========================
  // NEXT REFERENCE NO
  // =========================

  loadNextReferenceNo(): void {
    this.settingsService.getControlPanel().subscribe({
      next: (settingsResponse: any) => {
        const controlPanelSettings =
          settingsResponse?.controlPanelSetting ??
          settingsResponse?.data?.controlPanelSetting ??
          settingsResponse?.data ??
          settingsResponse;

        const autoSerialNumberEnabled =
          controlPanelSettings.serialno === true ||
          controlPanelSettings.serialno === 1 ||
          controlPanelSettings.serialno === "1";

        const configuredStartSerialNo = Number(
          controlPanelSettings.startSerialno
        );

        this.labTestService.getNextReferenceNo().subscribe({
          next: (response: any) => {
            const nextReferenceNo =
              response?.data?.nextReferenceNo ??
              response?.nextReferenceNo ??
              response?.data ??
              response;

            const serialNo = Number(nextReferenceNo);

            if (
              serialNo === 1 &&
              autoSerialNumberEnabled &&
              controlPanelSettings.startSerialno !== null &&
              controlPanelSettings.startSerialno !== undefined &&
              controlPanelSettings.startSerialno !== "" &&
              Number.isFinite(configuredStartSerialNo)
            ) {
              this.patient.serialno = configuredStartSerialNo;
            } else {
              this.patient.serialno = serialNo;
            }

            console.log("Control Panel Settings:", controlPanelSettings);
            console.log("API Next Reference No:", serialNo);
            console.log("Final Reference No:", this.patient.serialno);
          },

          error: (error: any) => {
            console.error("Reference No. loading failed:", error);
            alert("Unable to load Reference Number.");
          },
        });
      },

      error: (error: any) => {
        console.error("Control Panel Settings loading failed:", error);
        alert("Unable to load Control Panel Settings.");
      },
    });
  }

  // =========================
  // ALLOW NUMERIC DECIMAL
  // =========================

  allowNumericDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;

    if (
      event.ctrlKey ||
      event.metaKey ||
      [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(key)
    ) {
      return;
    }

    if (/^\d$/.test(key)) {
      return;
    }

    if (key === "." && !input.value.includes(".")) {
      return;
    }

    event.preventDefault();
  }

  // =========================
  // CLOSE
  // =========================

  close(): void {
    this.onClose.next(false);
    this.onClose.complete();

    this.bsModalRef.hide();
  }
}
