import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
import { LabTestService } from "../lab-test.service";

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
    date: this.getCurrentDateTime(),
    titleid: null as number | null,
    patientname: "",
    phone: "",
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

  constructor(
    public bsModalRef: BsModalRef,
    private labTestService: LabTestService
  ) {}

  ngOnInit(): void {
    this.loadTestGroups();
    this.loadTests();
    this.loadPatientTitles();
    this.loadDoctors();

    if (this.labTestData) {
      this.patient = {
        ...this.patient,
        ...this.labTestData,
      };

      this.testtranid =
        Number(
          this.labTestData.testTranId ??
            this.labTestData.testtranid ??
            this.labTestData.id
        ) || null;

      // Existing tests modal data mein available hain to use karo
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
          testvalue: test.testvalue ?? test.testValue ?? "",
        }));
      } else if (this.testtranid) {
        // Parent record se details nahi aayi to separate API call
        this.loadExistingTestDetails(this.testtranid);
      }
    } else {
      this.testtranid = null;
      this.loadNextReferenceNo();
    }
  }

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
          testvalue: test.testvalue ?? test.testValue ?? "",
        }));

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Error loading existing test details:", error);
        this.isLoading = false;
      },
    });
  }

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

        // Add mode: Automatically select first row's title
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

          // HTML me [value] use ho raha hai (string), isliye string me set karo
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
        testvalue: "",
      };

      // Find the last row of this group
      let lastGroupIndex = -1;

      for (let i = 0; i < this.selectedTests.length; i++) {
        if (this.getGroupId(this.selectedTests[i]) === groupId) {
          lastGroupIndex = i;
        }
      }

      if (lastGroupIndex !== -1) {
        // Insert after the last row of the same group
        this.selectedTests.splice(lastGroupIndex + 1, 0, newTest);
      } else {
        // Group not present: add at the end
        this.selectedTests.push(newTest);
      }
    });

    this.selectedAvailableTestIds = [];
    this.selectedTestIndex = null;
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

    // Group dropdown select
    this.selectedGroupId = groupId;

    // Right side se selected group ke saare tests ke IDs
    const groupTestIds = this.selectedTests
      .filter((test: any) => this.getGroupId(test) === groupId)
      .map((test: any) => this.getTestId(test));

    // Left side par group ke saare tests automatically selected
    this.selectedAvailableTestIds = [...groupTestIds];

    // Right side se poora group remove
    this.selectedTests = this.selectedTests.filter(
      (test: any) => this.getGroupId(test) !== groupId
    );

    // Selected row reset
    this.selectedTestIndex = null;
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

    this.isLoading = true;

    const titleId = this.patient.titleid ?? null;

    const payload = {
      ...this.patient,

      titleid: titleId,

      patientname: this.patient.patientname.trim(),

      details: this.selectedTests.map((test: any) => ({
        masterid: this.testtranid,
        groupid: test.groupid ?? test.groupId,
        testid: test.testid ?? test.testId,
        testvalue: test.testvalue || "",
      })),
    };

    console.log("Patient Title ID:", titleId);
    console.log("Save Lab Test Payload:", payload);

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

  getCurrentDateTime(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;

    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  }

  // =========================
  // NEXT REFERENCE NO
  // =========================

  loadNextReferenceNo(): void {
    this.labTestService.getNextReferenceNo().subscribe({
      next: (response: any) => {
        const nextReferenceNo =
          response?.data?.nextReferenceNo ??
          response?.data ??
          response?.nextReferenceNo ??
          response;

        this.patient.serialno = Number(nextReferenceNo);

        console.log("Next Reference No:", this.patient.serialno);
      },
      error: (error: any) => {
        console.error("Reference No. loading failed:", error);

        alert("Unable to load Reference Number.");
      },
    });
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
