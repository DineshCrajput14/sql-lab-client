import { Component, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LabTestService } from "./lab-test.service";
import { LabTestEditorComponent } from "./lab-test-editor/lab-test-editor.component";
import { LabTestPrintModalComponent } from "./lab-test-print-modal/lab-test-print-modal.component";

@Component({
  selector: "app-lab-test",
  templateUrl: "./lab-test.component.html",
})
export class LabTestComponent implements OnInit {
  labTests: any[] = [];
  filteredLabTests: any[] = [];

  searchText = "";
  isLoading = false;
  today: string = "";

  bsModalRef?: BsModalRef;

  // Doctor List
  doctors: any[] = [];

  // Highlight Abnormal Values
  highlightAbnormalValues = true;

  // Search Filters
  filters: any = {
    fromDate: "",
    toDate: "",
    refdoctor: "",
    testStatus: "All",
    widalStatus: "All",
    gender: "All",
    printStatus: "All",
    refNo: "",
    patientName: "",
    fhName: "",
  };

  // Selected Lab Test
  selectedLabTest: any = null;

  // Test Details
  selectedTests: any[] = [];
  selectedTest: any = null;
  selectedTestIndex = -1;

  testValueInput = "";

  // Test Value Editor Modal
  showTestValueEditor = false;

  // Widal Test Value Editor Modal (frontend-only until backend APIs are added)
  showWidalValueEditor = false;
  widalMethod = "1"; // tbwmethod: 1 = By Tube, 2 = By Slide
  widalResult = "Positive"; // Static frontend result: Positive=1, Negative=2
  widalMethods: any[] = [];
  isWidalDataLoading = false;
  isWidalSaving = false;

  widalEntryRows: any[] = [
    {
      wtestid: 1,
      wtestname: "Salmonella Typhi O",
      dilution1: "",
      dilution2: "",
      dilution3: "",
      dilution4: "",
      dilution5: "",
      dilution6: "",
    },
    {
      wtestid: 2,
      wtestname: "Salmonella Typhi H",
      dilution1: "",
      dilution2: "",
      dilution3: "",
      dilution4: "",
      dilution5: "",
      dilution6: "",
    },
    {
      wtestid: 3,
      wtestname: "Salmonella Paratyphi A (H)",
      dilution1: "",
      dilution2: "",
      dilution3: "",
      dilution4: "",
      dilution5: "",
      dilution6: "",
    },
    {
      wtestid: 4,
      wtestname: "Salmonella Paratyphi B (H)",
      dilution1: "",
      dilution2: "",
      dilution3: "",
      dilution4: "",
      dilution5: "",
      dilution6: "",
    },
  ];

  widalEntryColumns: string[] = [
    "1:20",
    "1:40",
    "1:80",
    "1:160",
    "1:320",
    "1:640",
  ];

  filteredRecords: any[] = [];

  fromDate: string = "";
  toDate: string = "";

  // Special Test Tabs
  activeSpecialTestTab: string = "LAB";

  widalDilutions: string[] = [
    "1:20",
    "1:40",
    "1:80",
    "1:160",
    "1:320",
    "1:640",
  ];

  widalTests: any[] = [];
  vdrlTests: any[] = [];
  raTests: any[] = [];

  constructor(
    private labTestService: LabTestService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.today = this.getTodayDate();

    this.filters.fromDate = this.today;
    this.filters.toDate = this.today;

    this.loadDoctors();
    this.loadWidalMethods();
    this.loadLabTests();
  }

  // Get Today's Date in YYYY-MM-DD Format
  getTodayDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Load All Doctors
  loadDoctors(): void {
    this.labTestService.getDoctors().subscribe({
      next: (response: any) => {
        console.log("Doctors API Response:", response);

        const records =
          response?.data?.doctors ?? response?.doctors ?? response?.data ?? [];

        this.doctors = Array.isArray(records) ? records : [];
      },

      error: (error: any) => {
        console.error("Error loading Doctors:", error);
        this.doctors = [];
      },
    });
  }

  // Load Lab Test Records
  loadLabTests(): void {
    this.isLoading = true;

    this.labTestService.getAll().subscribe({
      next: (response: any) => {
        console.log("Lab Test API Response:", response);

        const records = response?.data?.testTrans;

        this.labTests = Array.isArray(records) ? records : [];

        // Automatically populate records using current filters
        this.showRecords();

        this.isLoading = false;
      },

      error: (error: any) => {
        console.error("Error loading Lab Tests:", error);

        this.labTests = [];
        this.filteredLabTests = [];

        this.isLoading = false;

        alert(error?.error?.message || "Unable to load Lab Test records.");
      },
    });
  }

  // Apply Search Filters
  showRecords(): void {
    const fromDate = this.toDateString(this.filters.fromDate);
    const toDate = this.toDateString(this.filters.toDate);

    const patientName = String(this.filters.patientName || "")
      .trim()
      .toLowerCase();

    const fhName = String(this.filters.fhName || "")
      .trim()
      .toLowerCase();

    const refDoctor = String(this.filters.refdoctor || "").trim();

    const refNo = String(this.filters.refNo || "")
      .trim()
      .toLowerCase();

    this.filteredLabTests = this.labTests.filter((item: any) => {
      const recordDate = this.toDateString(item.date);

      // Date Filter
      if (fromDate && recordDate < fromDate) {
        return false;
      }

      if (toDate && recordDate > toDate) {
        return false;
      }

      // Patient Name Filter
      if (
        patientName &&
        !String(item.patientname || "")
          .toLowerCase()
          .includes(patientName)
      ) {
        return false;
      }

      // F/H Name Filter
      if (
        fhName &&
        !String(item.fhname || "")
          .toLowerCase()
          .includes(fhName)
      ) {
        return false;
      }

      // Ref Doctor Filter using Doctor ID
      if (refDoctor && String(item.refdoctor ?? "") !== refDoctor) {
        return false;
      }

      // Reference Number Filter
      if (
        refNo &&
        !String(item.serialno || "")
          .toLowerCase()
          .includes(refNo)
      ) {
        return false;
      }

      // Gender Filter
      if (
        this.filters.gender !== "All" &&
        String(item.gender || "").toLowerCase() !==
          String(this.filters.gender).toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  }

  // Convert Date to YYYY-MM-DD
  private toDateString(value: any): string {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

      if (match) {
        return match[1];
      }
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Clear Filters
  clearFilters(): void {
    this.today = this.getTodayDate();

    this.filters = {
      fromDate: this.today,
      toDate: this.today,
      refdoctor: "",
      testStatus: "All",
      widalStatus: "All",
      gender: "All",
      printStatus: "All",
      refNo: "",
      patientName: "",
      fhName: "",
    };

    this.searchText = "";

    this.showRecords();
  }

  // Search Lab Test Records
  applyFilter(): void {
    const search = this.searchText.trim().toLowerCase();

    this.showRecords();

    if (!search) {
      return;
    }

    this.filteredLabTests = this.filteredLabTests.filter((item: any) => {
      return (
        String(item.serialno ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.patientname ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.fhname ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.refdoctorname ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.refdoctor ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.gender ?? "")
          .toLowerCase()
          .includes(search) ||
        String(item.age ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }

  // Select Lab Test Record and Load Selected Tests
  selectLabTest(item: any): void {
    this.selectedLabTest = item;

    this.selectedTests = [];
    this.selectedTest = null;
    this.selectedTestIndex = -1;
    this.testValueInput = "";
    this.showTestValueEditor = false;
    this.showWidalValueEditor = false;

    // Load VDRL and RA data
    this.loadSpecialTests(item);

    const id = Number(item.testtranid ?? item.testTranId);

    if (!id) {
      console.error("Test Transaction ID not found:", item);
      alert("Lab Test ID not found.");
      return;
    }

    // ==========================================
    // LOAD NORMAL LAB TEST DETAILS
    // ==========================================
    this.labTestService.getDetails(id).subscribe({
      next: (response: any) => {
        console.log("Selected Patient Test Details API:", response);

        const details =
          response?.data?.testDetails ??
          response?.data?.testdetails ??
          response?.data?.testTranDetails ??
          response?.data?.testTranDetail ??
          response?.data?.details ??
          response?.testDetails ??
          response?.testdetails ??
          response?.details ??
          response?.data;

        if (Array.isArray(details)) {
          this.selectedTests = details.map((test: any) => ({
            ...test,
            testvalue: test.testvalue ?? test.testValue ?? "",
            testValue: test.testvalue ?? test.testValue ?? "",
          }));
        } else {
          this.selectedTests = [];

          console.error("Test details response is not an array:", response);
        }

        console.log("Loaded Selected Tests:", this.selectedTests);
      },

      error: (error: any) => {
        console.error("Error loading selected patient tests:", error);

        this.selectedTests = [];

        alert(
          error?.error?.message ||
            "Unable to load selected patient's test details."
        );
      },
    });

    // ==========================================
    // LOAD WIDAL TEST DATA
    // ==========================================
    this.labTestService.getWidalData(id).subscribe({
      next: (response: any) => {
        console.log("Selected Patient Widal Data API:", response);

        const data = response?.data?.widalData ?? response?.data ?? {};

        const tests = data?.tests ?? data?.widalTests ?? data?.widaltests ?? [];

        // ==========================================
        // LOAD WIDAL METHOD AND RESULT
        // ==========================================
        const methodResult = data?.methodResult ?? data?.methodresult ?? {};

        this.widalMethod = methodResult.methodid ?? methodResult.methodId ?? "";

        this.widalResult = methodResult.resultid ?? methodResult.resultId ?? "";

        // ==========================================
        // LOAD RIGHT SIDE WIDAL GRID
        // ==========================================
        if (Array.isArray(tests)) {
          this.widalTests = tests.map((test: any) => {
            const values: any = {};

            // Actual database dilution values
            const dilutionValues = [
              test.Dilution1 ?? test.dilution1 ?? "",
              test.Dilution2 ?? test.dilution2 ?? "",
              test.Dilution3 ?? test.dilution3 ?? "",
              test.Dilution4 ?? test.dilution4 ?? "",
              test.Dilution5 ?? test.dilution5 ?? "",
              test.Dilution6 ?? test.dilution6 ?? "",
            ];

            this.widalDilutions.forEach((dilution: string, index: number) => {
              // Store actual value, NOT boolean true/false
              values[dilution] = dilutionValues[index];
            });

            return {
              ...test,

              // Widal Test Name
              testname:
                test.wtestname ??
                test.WTestName ??
                test.testname ??
                test.testName ??
                "",

              // Actual dilution values
              values: values,
            };
          });
        } else {
          this.widalTests = [];
        }

        console.log("Loaded Right Side Widal Grid:", this.widalTests);

        console.log("Loaded Widal Method:", this.widalMethod);
        console.log("Loaded Widal Result:", this.widalResult);
      },

      error: (error: any) => {
        console.error("Error loading selected patient Widal data:", error);

        this.widalTests = [];
        this.widalMethod = "";
        this.widalResult = "";
      },
    });
  }

  // Display Group Name Only Once for Consecutive Group Rows
  displayGroupName(index: number): string {
    const currentTest = this.selectedTests[index];

    const currentGroupName = String(
      currentTest?.groupname ?? currentTest?.groupName ?? ""
    ).trim();

    if (!currentGroupName) {
      return "";
    }

    // First row always displays group name
    if (index === 0) {
      return currentGroupName;
    }

    const previousTest = this.selectedTests[index - 1];

    const currentGroupId = currentTest?.groupid ?? currentTest?.groupId;
    const previousGroupId = previousTest?.groupid ?? previousTest?.groupId;

    let sameGroup = false;

    if (currentGroupId != null && previousGroupId != null) {
      sameGroup = String(currentGroupId) === String(previousGroupId);
    } else {
      const previousGroupName = String(
        previousTest?.groupname ?? previousTest?.groupName ?? ""
      )
        .trim()
        .toLowerCase();

      sameGroup = currentGroupName.toLowerCase() === previousGroupName;
    }

    return sameGroup ? "" : currentGroupName;
  }

  // Load Special Tests
  // Load Special Tests
  private loadSpecialTests(item: any): void {
    const vdrl = item?.vdrlTests ?? item?.vdrltests ?? [];
    const ra = item?.raTests ?? item?.ratests ?? [];

    // Widal data will be loaded separately from API
    // this.widalTests = [];

    // Load VDRL Tests
    this.vdrlTests = Array.isArray(vdrl)
      ? vdrl.map((test: any) => ({
          ...test,
        }))
      : [];

    // Load RA Tests
    this.raTests = Array.isArray(ra)
      ? ra.map((test: any) => ({
          ...test,
        }))
      : [];
  }

  // Check whether Widal entry is enabled for the selected transaction
  isWidalEnabled(): boolean {
    const value =
      this.selectedLabTest?.widaltest ??
      this.selectedLabTest?.widalTest ??
      this.selectedLabTest?.widaltests;

    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      String(value).toLowerCase() === "true" ||
      String(value).toLowerCase() === "yes"
    );
  }

  // Load Widal Method dropdown options from API
  loadWidalMethods(): void {
    this.labTestService.getWidalMethods().subscribe({
      next: (response: any) => {
        const records =
          response?.data?.methods ?? response?.methods ?? response?.data ?? [];

        this.widalMethods = Array.isArray(records) ? records : [];

        if (
          this.widalMethods.length > 0 &&
          !this.widalMethods.some(
            (method: any) =>
              String(method.methodid) === String(this.widalMethod)
          )
        ) {
          this.widalMethod = String(this.widalMethods[0].methodid);
        }
      },
      error: (error: any) => {
        console.error("Error loading Widal Methods:", error);
        this.widalMethods = [];
        alert(error?.error?.message || "Unable to load Widal Methods.");
      },
    });
  }

  // Open Widal Test Value Editor and load previously saved Widal data
  openWidalValueEditor(): void {
    if (!this.selectedLabTest) {
      alert("Please select a Lab Test record first.");
      return;
    }

    if (!this.isWidalEnabled()) {
      alert("Widal Test is not enabled for this patient.");
      return;
    }

    const patientId = Number(
      this.selectedLabTest.testtranid ?? this.selectedLabTest.testTranId
    );

    if (!patientId) {
      alert("Lab Test ID not found.");
      return;
    }

    this.showWidalValueEditor = true;
    this.isWidalDataLoading = true;

    this.labTestService.getWidalData(patientId).subscribe({
      next: (response: any) => {
        const data =
          response?.data?.widalData ??
          response?.widalData ??
          response?.data ??
          {};

        const methodResult = data?.methodResult ?? data?.methodresult ?? null;

        if (methodResult) {
          this.widalMethod = String(
            methodResult.methodid ?? methodResult.MethodId ?? "1"
          );

          const resultId = Number(
            methodResult.resultid ?? methodResult.ResultId ?? 1
          );

          this.widalResult = resultId === 2 ? "Negative" : "Positive";
        } else {
          this.widalMethod = this.widalMethods.length
            ? String(this.widalMethods[0].methodid)
            : "1";
          this.widalResult = "Positive";
        }

        const savedTests = Array.isArray(data?.tests) ? data.tests : [];

        this.widalEntryRows = this.widalEntryRows.map((defaultRow: any) => {
          const savedRow = savedTests.find(
            (row: any) =>
              Number(row.WTestId ?? row.wtestid ?? row.wtestId) ===
              Number(defaultRow.wtestid)
          );

          return {
            ...defaultRow,
            dilution1: String(savedRow?.Dilution1 ?? savedRow?.dilution1 ?? ""),
            dilution2: String(savedRow?.Dilution2 ?? savedRow?.dilution2 ?? ""),
            dilution3: String(savedRow?.Dilution3 ?? savedRow?.dilution3 ?? ""),
            dilution4: String(savedRow?.Dilution4 ?? savedRow?.dilution4 ?? ""),
            dilution5: String(savedRow?.Dilution5 ?? savedRow?.dilution5 ?? ""),
            dilution6: String(savedRow?.Dilution6 ?? savedRow?.dilution6 ?? ""),
          };
        });

        this.isWidalDataLoading = false;
      },
      error: (error: any) => {
        console.error("Error loading Widal data:", error);
        this.isWidalDataLoading = false;
        alert(error?.error?.message || "Unable to load Widal data.");
      },
    });
  }

  // Close Widal Test Value Editor
  closeWidalValueEditor(): void {
    this.showWidalValueEditor = false;
  }

  // Save Widal Method, Result and dilution values to backend

  saveWidalTestValues(): void {
    if (!this.isWidalEnabled()) {
      alert("Widal Test is not enabled for this patient.");
      return;
    }

    if (this.isWidalSaving) {
      return;
    }

    const testTranId = Number(
      this.selectedLabTest?.testtranid ?? this.selectedLabTest?.testTranId
    );

    if (!testTranId) {
      alert("Lab Test ID not found.");
      return;
    }

    const methodId = Number(this.widalMethod);
    const resultId = this.widalResult === "Negative" ? 2 : 1;

    if (![1, 2].includes(methodId)) {
      alert("Please select a valid Widal Method.");
      return;
    }

    // Dilution1 to Dilution6 will be saved
    // Dilution7 to Dilution10 will remain blank in backend
    const widalTests = this.widalEntryRows.map((row: any) => ({
      wtestid: Number(row.wtestid),
      dilution1: String(row.dilution1 ?? ""),
      dilution2: String(row.dilution2 ?? ""),
      dilution3: String(row.dilution3 ?? ""),
      dilution4: String(row.dilution4 ?? ""),
      dilution5: String(row.dilution5 ?? ""),
      dilution6: String(row.dilution6 ?? ""),
    }));

    const payload = {
      widalMethodId: methodId,
      widalResultId: resultId,
      widalTests: widalTests,
    };

    console.log("Widal Save Patient ID:", testTranId);
    console.log("Widal Save Payload:", payload);

    this.isWidalSaving = true;

    // IMPORTANT: Use separate Widal API instead of Lab Test update API
    this.labTestService.saveWidalData(testTranId, payload).subscribe({
      next: (response: any) => {
        console.log("Widal Save Response:", response);

        this.isWidalSaving = false;
        this.showWidalValueEditor = false;

        alert(response?.message || "Widal values saved successfully.");
      },

      error: (error: any) => {
        console.error("Error saving Widal values:", error);

        this.isWidalSaving = false;

        alert(
          error?.error?.message ||
            "Unable to save Widal values. Please try again."
        );
      },
    });
  }
  // Select Test Detail
  selectTest(test: any, index: number): void {
    this.selectedTest = test;
    this.selectedTestIndex = index;

    this.testValueInput = String(test.testvalue ?? test.testValue ?? "");
  }

  // Edit Test
  editTest(test: any, index: number): void {
    this.selectTest(test, index);
    this.openTestValueEditor();
  }

  // Open Test Value Editor - All Tests at Once
  openTestValueEditor(): void {
    if (!this.selectedLabTest) {
      alert("Please select a Lab Test record first.");
      return;
    }

    if (!this.selectedTests || this.selectedTests.length === 0) {
      alert("No test details available to edit.");
      return;
    }

    // Normalize all test values before opening editor
    this.selectedTests = this.selectedTests.map((test: any) => ({
      ...test,
      testvalue: test.testvalue ?? test.testValue ?? "",
      testValue: test.testvalue ?? test.testValue ?? "",
    }));

    this.showTestValueEditor = true;
  }

  // Close Test Value Editor
  closeTestValueEditor(): void {
    this.showTestValueEditor = false;
  }

  // Update All Test Values
  saveTestValue(): void {
    if (!this.selectedLabTest) {
      alert("Please select a Lab Test record first.");
      return;
    }

    if (!this.selectedTests || this.selectedTests.length === 0) {
      alert("No test details available to update.");
      return;
    }

    const testTranId = Number(
      this.selectedLabTest.testtranid ?? this.selectedLabTest.testTranId
    );

    if (!testTranId) {
      alert("Lab Test Reference ID not found.");
      return;
    }

    // Prepare details for database update
    const details = this.selectedTests.map((test: any) => ({
      masterid: test.masterid ?? test.masterId ?? testTranId,
      groupid: test.groupid ?? test.groupId,
      testid: test.testid ?? test.testId,
      testvalue: String(test.testvalue ?? test.testValue ?? ""),
    }));

    // Parent record + test details
    const payload = {
      ...this.selectedLabTest,
      details: details,
    };

    console.log("Updating Lab Test ID:", testTranId);
    console.log("Update Payload:", payload);

    this.labTestService.update(testTranId, payload).subscribe({
      next: (response: any) => {
        console.log("Test Values Update Response:", response);

        // Update local list after successful API response
        this.selectedTests = this.selectedTests.map((test: any) => {
          const value = String(test.testvalue ?? test.testValue ?? "");

          return {
            ...test,
            testvalue: value,
            testValue: value,
          };
        });

        if (this.selectedTestIndex >= 0) {
          this.selectedTest = this.selectedTests[this.selectedTestIndex];
        }

        this.showTestValueEditor = false;

        alert(response?.message || "Test values saved successfully.");
      },

      error: (error: any) => {
        console.error("Error saving Test Values:", error);

        alert(
          error?.error?.message ||
            "Unable to save Test Values. Please try again."
        );
      },
    });
  }

  // Get Patient Gender
  getPatientGender(): string {
    return String(this.selectedLabTest?.gender || "")
      .trim()
      .toLowerCase();
  }

  // Get Male/Female Normal Value
  getNormalValue(test: any): string {
    const gender = this.getPatientGender();

    if (gender === "male" || gender === "m") {
      return String(
        test.normalvaluem ?? test.normalValueM ?? test.normal_value_m ?? ""
      );
    }

    if (gender === "female" || gender === "f") {
      return String(
        test.normalvaluef ?? test.normalValueF ?? test.normal_value_f ?? ""
      );
    }

    return "";
  }

  printNewLabReport(): void {
    if (!this.selectedLabTest) {
      alert("Please select a Lab Test record first.");
      return;
    }

    const testTranId = Number(
      this.selectedLabTest.testtranid ?? this.selectedLabTest.testTranId
    );

    if (!testTranId) {
      alert("Lab Test ID not found.");
      return;
    }

    // Fetch WIDAL data before opening print modal
    this.labTestService.getWidalData(testTranId).subscribe({
      next: (response: any) => {
        console.log("WIDAL API Response for Print:", response);

        const data =
          response?.data?.widalData ??
          response?.widalData ??
          response?.data ??
          {};

        const tests = data?.tests ?? data?.widalTests ?? data?.widaltests ?? [];

        // Prepare WIDAL data for print modal
        const printWidalTests = Array.isArray(tests)
          ? tests.map((test: any) => {
              const values: any = {};

              const dilutionValues = [
                test.Dilution1 ?? test.dilution1 ?? "",
                test.Dilution2 ?? test.dilution2 ?? "",
                test.Dilution3 ?? test.dilution3 ?? "",
                test.Dilution4 ?? test.dilution4 ?? "",
                test.Dilution5 ?? test.dilution5 ?? "",
                test.Dilution6 ?? test.dilution6 ?? "",
              ];

              this.widalDilutions.forEach((dilution: string, index: number) => {
                values[dilution] = dilutionValues[index];
              });

              return {
                ...test,

                testname:
                  test.wtestname ??
                  test.WTestName ??
                  test.testname ??
                  test.testName ??
                  "",

                values: values,
              };
            })
          : [];

        console.log("WIDAL Data Passed to Print Modal:", printWidalTests);

        // Update component WIDAL data
        this.widalTests = printWidalTests;

        // Open Print Modal only after WIDAL data is loaded
        this.bsModalRef = this.modalService.show(LabTestPrintModalComponent, {
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: true,
          initialState: {
            testtranid: testTranId,
            patientData: this.selectedLabTest,
            selectedTests: this.selectedTests,
            widalTests: printWidalTests,
          },
        });
      },

      error: (error: any) => {
        console.error("Error loading WIDAL data for print:", error);

        alert(
          error?.error?.message || "Unable to load WIDAL data for printing."
        );
      },
    });
  }

  printTestDetails(): void {
    console.log("PRINT BUTTON CLICKED", this.selectedLabTest);

    // window.print();

    if (!this.selectedLabTest) {
      return;
    }

    const printContent = document.getElementById("testDetailsPrint");

    if (!printContent) {
      console.error("Test Details print section not found.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=700");

    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Details</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
          }

          h3 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }

          th {
            background: #eee;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <h3>Test Details</h3>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  // Get Minimum and Maximum Normal Range
  getNormalRangeBounds(test: any): { min: number; max: number } | null {
    const range = this.getNormalValue(test);

    if (!range) {
      return null;
    }

    const match = range.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/
    );

    if (!match) {
      return null;
    }

    const min = Number(match[1]);
    const max = Number(match[2]);

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return null;
    }

    return { min, max };
  }

  // Check Abnormal Value
  isAbnormalValue(test: any): boolean {
    if (!this.highlightAbnormalValues) {
      return false;
    }

    const rawValue = String(test.testvalue ?? test.testValue ?? "").trim();

    if (!rawValue) {
      return false;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return false;
    }

    const range = this.getNormalRangeBounds(test);

    if (!range) {
      return false;
    }

    return value < range.min || value > range.max;
  }

  // Remove Test from Current Selection
  removeTest(index: number): void {
    if (!confirm("Are you sure you want to remove this test from the list?")) {
      return;
    }

    this.selectedTests.splice(index, 1);

    this.selectedTest = null;
    this.selectedTestIndex = -1;
    this.testValueInput = "";

    this.showTestValueEditor = false;
  }

  // Open Editor for New Lab Test
  addLabTest(): void {
    this.bsModalRef = this.modalService.show(LabTestEditorComponent, {
      class: "modal-xl",
      backdrop: "static",
      keyboard: false,
      initialState: {
        testtranid: null,
        labTestData: null,
      },
    });

    this.bsModalRef.content.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.loadLabTests();
      }
    });
  }

  // Open Editor for Existing Lab Test
  // =========================
  // EDIT EXISTING LAB TEST
  // =========================

  editLabTest(item: any): void {
    console.log("EDIT ROW ITEM:", item);

    const id = Number(item.testtranid ?? item.testTranId);

    if (!id) {
      alert("Lab Test ID not found.");
      return;
    }

    this.labTestService.getById(id).subscribe({
      next: (response: any) => {
        console.log("GET BY ID RESPONSE:", response);

        const record =
          response?.data?.testTran ??
          response?.data?.labTest ??
          response?.data?.record ??
          response?.labTest ??
          response?.record ??
          response?.data ??
          response;

        console.log("EDIT RECORD:", record);

        this.bsModalRef = this.modalService.show(LabTestEditorComponent, {
          class: "modal-xl",
          backdrop: "static",
          keyboard: false,
          initialState: {
            testtranid: id,
            labTestData: record,
          },
        });

        this.bsModalRef.content.onClose.subscribe((saved: boolean) => {
          if (saved) {
            this.loadLabTests();
          }
        });
      },

      error: (error: any) => {
        console.error("Error loading Lab Test:", error);
        alert("Unable to load the selected Lab Test.");
      },
    });
  }
  // Delete Lab Test
  deleteLabTest(item: any): void {
    const id = Number(item.testtranid ?? item.testTranId);

    if (!id) {
      alert("Lab Test ID not found.");
      return;
    }

    const patientName = item.patientname || "this patient";

    if (
      !confirm(
        `Are you sure you want to delete the Lab Test record for ${patientName}?`
      )
    ) {
      return;
    }

    this.labTestService.delete(id).subscribe({
      next: (response: any) => {
        alert(response?.message || "Lab Test deleted successfully.");

        this.loadLabTests();
      },

      error: (error: any) => {
        console.error("Error deleting Lab Test:", error);

        alert(error?.error?.message || "Unable to delete Lab Test record.");
      },
    });
  }

  // Open New Lab Test Print Modal
  printLabTestModal(): void {
    if (!this.selectedLabTest) {
      alert("Please select a Lab Test record first.");
      return;
    }

    const testTranId = Number(
      this.selectedLabTest.testtranid ?? this.selectedLabTest.testTranId
    );

    if (!testTranId) {
      alert("Lab Test ID not found.");
      return;
    }

    this.bsModalRef = this.modalService.show(LabTestPrintModalComponent, {
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: true,
      initialState: {
        testtranid: testTranId,
        patientData: this.selectedLabTest,
        selectedTests: this.selectedTests,
      },
    });
  }
}
