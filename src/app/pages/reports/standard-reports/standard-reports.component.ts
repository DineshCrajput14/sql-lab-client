import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { NgForm } from "@angular/forms";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { PropertiesService } from "../../properties/properties.service";
import { BuildingsService } from "../../buildings/buildings.service";
import { UnitsService } from "../../units/units.service";
import { StandardReportsService } from "./standard-reports.service";
import { StandardReportsPrepareGridColumnDefsService } from "./standard-reports-prepare-grid-columnDefs.service";
import { StandardReportsDataService } from "./standard-reports-data.service";
import { StandardReportsExcelExportService } from "./standard-reports-excel-export.service";

@Component({
  selector: "app-standard-reports",
  templateUrl: "./standard-reports.component.html",
  styleUrls: ["./standard-reports.component.scss"],
})
export class StandardReportsComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  reportCode: string = "";
  reportTitle: string = "Report";
  isLoading: boolean = false;
  gridApi: GridApi;
  rowCount: number = 0;
  defaultColDef = { resizable: true };

  columnDefs = [];
  rowData = [];
  gridPinnedBottomRow = [];

  propertiesList = [];
  buildingsList = [];
  filteredBuildingsList = [];
  unitsList = [];
  filteredUnitsList = [];

  statusList = [
    { id: "ALL", name: "All" },
    { id: "Active", name: "Active" },
    { id: "In-Active", name: "In-Active" },
  ];

  searchOptionsList = [];
  months = [];

  monthwiseOptionsList = [
    { id: "N", name: "No" },
    { id: "Y", name: "Yes" },
  ];

  occupancyRows = [];
  occupancySummary = {
    total: 0,
    occupied: 0,
    vacant: 0,
    maintenance: 0,
  };

  search: {
    fromDate: Date;
    toDate: Date;
    propertyId: number | string;
    buildingId: number | string;
    unitId: number | string;
    status: string;
    monthwise?: string;
    searchField: string;
    keyword: string;
  } = {
    fromDate: moment().toDate(),
    toDate: moment().toDate(),
    propertyId: "ALL",
    buildingId: "ALL",
    unitId: "ALL",
    status: "ALL",
    monthwise: "N",
    searchField: "ALL",
    keyword: "",
  };

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private standardReportsService: StandardReportsService,
    private columnDefsService: StandardReportsPrepareGridColumnDefsService,
    private reportsDataService: StandardReportsDataService,
    private excelExportService: StandardReportsExcelExportService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.reportCode = params["reportCode"];
      this.initReportConfig();
      this.getProperties();
      this.getBuildings();
      this.getUnits();
      this.searchReport();
    });
  }

  initReportConfig() {
    this.title.setTitle("Report | PMS");
    this.search = {
      fromDate: moment().toDate(),
      toDate: moment().toDate(),
      propertyId: "ALL",
      buildingId: "ALL",
      unitId: "ALL",
      status: "ALL",
      monthwise: "N",
      searchField: "ALL",
      keyword: "",
    };
    this.months = [];
    if (this.reportCode === "tenant-register") {
      this.reportTitle = "Tenant Register";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [
        { id: "ALL", name: "All" },
        { id: "regNo", name: "Reg. No." },
        { id: "tenantName", name: "Tenant Name" },
      ];
    } else if (this.reportCode === "monthly-rent-register") {
      this.reportTitle = "Rent Register";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [
        { id: "ALL", name: "All" },
        { id: "rcptNo", name: "Rcpt No." },
        { id: "tenantName", name: "Tenant Name" },
        { id: "regNo", name: "Reg. No." },
      ];
    } else if (this.reportCode === "monthly-refund-register") {
      this.reportTitle = "Refund Register";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [
        { id: "ALL", name: "All" },
        { id: "rcptNo", name: "Rcpt No." },
        { id: "tenantName", name: "Tenant Name" },
        { id: "regNo", name: "Reg. No." },
      ];
    } else if (this.reportCode === "outstanding") {
      this.reportTitle = "Outstanding Register";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [
        { id: "ALL", name: "All" },
        { id: "regNo", name: "Reg. No." },
        { id: "tenantName", name: "Tenant Name" },
      ];
    } else if (this.reportCode === "occupancy-report") {
      this.reportTitle = "Occupancy Status";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "OCCUPIED", name: "Occupied" },
        { id: "VACANT", name: "Vacant" },
        { id: "MAINTENANCE", name: "Maintenance" },
      ];
      this.searchOptionsList = [{ id: "ALL", name: "All" }];
    } else if (this.reportCode === "agreement-expiry") {
      this.reportTitle = "Agreement Status";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [
        { id: "ALL", name: "All" },
        { id: "unitNo", name: "Unit" },
        { id: "tenantName", name: "Tenant Name" },
      ];
    } else {
      this.reportTitle = "Standard Report";
      this.statusList = [
        { id: "ALL", name: "All" },
        { id: "Active", name: "Active" },
        { id: "In-Active", name: "In-Active" },
      ];
      this.searchOptionsList = [{ id: "ALL", name: "All" }];
    }
    this.columnDefs = this.columnDefsService.prepareStaticGridColumnDefs(
      this.reportCode,
      this.search,
      this.months
    );
    if (this.gridApi) {
      this.gridApi.setColumnDefs(this.columnDefs);
    }
  }

  getProperties() {
    this.propertiesList = [];
    this.propertiesService.getProperties().subscribe({
      next: (resultGetProperties) => {
        this.propertiesList = resultGetProperties?.properties || [];
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  getBuildings() {
    this.buildingsList = [];
    this.filteredBuildingsList = [];
    this.buildingsService.getBuildings().subscribe({
      next: (resultGetBuildings) => {
        this.buildingsList = resultGetBuildings?.buildings || [];
        this.filteredBuildingsList = this.buildingsList;
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  getUnits() {
    this.unitsList = [];
    this.filteredUnitsList = [];
    this.unitsService.getUnits().subscribe({
      next: (resultGetUnits) => {
        this.unitsList = resultGetUnits?.units || [];
        this.filteredUnitsList = this.unitsList;
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  onPropertyChange() {
    if (this.search.propertyId && this.search.propertyId !== "ALL") {
      this.filteredBuildingsList = this.buildingsList.filter(
        (building) => building.propertyId === Number(this.search.propertyId)
      );
    } else {
      this.filteredBuildingsList = this.buildingsList;
    }
    this.search.buildingId = "ALL";
    this.search.unitId = "ALL";
    this.onBuildingChange();
  }

  onBuildingChange() {
    if (this.search.buildingId && this.search.buildingId !== "ALL") {
      this.filteredUnitsList = this.unitsList.filter(
        (unit) => unit.buildingId === Number(this.search.buildingId)
      );
    } else if (this.search.propertyId && this.search.propertyId !== "ALL") {
      this.filteredUnitsList = this.unitsList.filter(
        (unit) => unit.propertyId === Number(this.search.propertyId)
      );
    } else {
      this.filteredUnitsList = this.unitsList;
    }
    this.search.unitId = "ALL";
  }

  getRowHeight = (params) => {
    if (this.reportCode === "occupancy-report") {
      const units = params.data?.units || [];
      if (!units.length) return 56;
      const cardsPerRow = 5;
      const lines = Math.max(1, Math.ceil(units.length / cardsPerRow));
      return Math.max(76, lines * 64 + 14);
    }
    return 42;
  };

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onGridFilterChanged(params) {
    this.rowCount = params.api?.getDisplayedRowCount();
    const filteredRows = [];
    params.api?.forEachNodeAfterFilter((node) => {
      if (node.data) {
        filteredRows.push(node.data);
      }
    });
    this.gridPinnedBottomRow = this.reportsDataService.prepareGridPinnedBottomRow(
      this.reportCode,
      this.search,
      filteredRows,
      this.months
    );
  }

  prepareSearchParams() {
    const params: any = {};
    if (this.search.propertyId && this.search.propertyId !== "ALL") {
      params.propertyId = this.search.propertyId;
    }
    if (this.search.buildingId && this.search.buildingId !== "ALL") {
      params.buildingId = this.search.buildingId;
    }
    if (this.search.unitId && this.search.unitId !== "ALL") {
      params.unitId = this.search.unitId;
    }
    if (this.search.status && this.search.status !== "ALL") {
      params.status = this.search.status;
    }

    if (this.reportCode === "occupancy-report") {
      return params;
    }

    if (this.search.fromDate) {
      params.fromDate = moment(this.search.fromDate).format("YYYY-MM-DD");
    }
    if (this.search.toDate) {
      params.toDate = moment(this.search.toDate).format("YYYY-MM-DD");
    }
    if (this.search.searchField && this.search.searchField !== "ALL") {
      params.searchField = this.search.searchField;
    }
    if (this.search.keyword && this.search.keyword.trim()) {
      params.keyword = this.search.keyword.trim();
    }
    if (this.reportCode === "outstanding" && this.search.monthwise) {
      params.monthwise = this.search.monthwise;
    }
    return params;
  }

  searchReport() {
    if (this.reportCode === "occupancy-report") {
      this.loadOccupancyReport();
      return;
    }

    if (this.search.fromDate && this.search.toDate) {
      const fromMoment = moment(this.search.fromDate).startOf("day");
      const toMoment = moment(this.search.toDate).startOf("day");
      if (toMoment.isBefore(fromMoment)) {
        this.toastrMessage.showWarning(
          "To Date should not be less than From Date."
        );
        return;
      }
    }

    this.rowCount = 0;
    this.rowData = [];
    this.gridPinnedBottomRow = [];
    this.isLoading = true;
    const searchParams = this.prepareSearchParams();

    this.standardReportsService
      .getReportData(this.reportCode, searchParams)
      .subscribe({
        next: (resultStandardReport) => {
          const reportRows = resultStandardReport?.report || [];
          this.months = resultStandardReport?.months || [];

          if (this.reportCode === "outstanding") {
            this.columnDefs = this.columnDefsService.prepareStaticGridColumnDefs(
              this.reportCode,
              this.search,
              this.months
            );
          }

          this.rowData = this.reportsDataService.prepareGridRows(
            this.reportCode,
            this.search,
            reportRows
          );
          this.gridPinnedBottomRow = this.reportsDataService.prepareGridPinnedBottomRow(
            this.reportCode,
            this.search,
            this.rowData,
            this.months
          );
          this.rowCount = this.rowData.length;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
        complete: () => {
          if (!this.rowData.length) {
            return this.toastrMessage.showWarning("No Records Found");
          }
        },
      });
  }

  loadOccupancyReport() {
    this.rowCount = 0;
    this.occupancyRows = [];
    this.isLoading = true;
    const searchParams = this.prepareSearchParams();

    this.standardReportsService
      .getReportData("occupancy-report", searchParams)
      .subscribe({
        next: (resultOccupancyReport) => {
          const reportRows = resultOccupancyReport?.report || [];
          this.occupancyRows = this.reportsDataService.prepareOccupancyRows(
            this.search,
            reportRows
          );
          this.occupancySummary = this.reportsDataService.calculateOccupancySummary(
            this.occupancyRows
          );
          this.rowCount = this.occupancySummary.total;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
        complete: () => {
          if (!this.occupancyRows.length) {
            return this.toastrMessage.showWarning("No Records Found");
          }
        },
      });
  }

  prepareExportSearchInfo() {
    const selectedProperty = (this.propertiesList || []).find(
      (property) => String(property.id) === String(this.search.propertyId)
    );
    const selectedBuilding = (this.buildingsList || []).find(
      (building) => String(building.id) === String(this.search.buildingId)
    );
    const selectedUnit = (this.unitsList || []).find(
      (unit) => String(unit.id) === String(this.search.unitId)
    );
    const selectedSearchOption = (this.searchOptionsList || []).find(
      (option) => String(option.id) === String(this.search.searchField)
    );

    return {
      ...this.search,
      propertyName: selectedProperty?.name || "All",
      buildingName: selectedBuilding?.name || "All",
      unitName: selectedUnit?.unitNo || "All",
      searchOptionName: selectedSearchOption?.name || "All",
    };
  }

  exportFile() {
    const exportSearchInfo = this.prepareExportSearchInfo();

    if (this.reportCode === "occupancy-report") {
      if (!this.occupancyRows || !this.occupancyRows.length) {
        this.toastrMessage.showWarning("No data available to export");
        return;
      }
      this.excelExportService.generateExcelExportFile(
        this.reportCode,
        this.occupancyRows,
        `${this.reportTitle.replace(/\s+/g, "_")}_${moment().format(
          "DD_MM_YYYY"
        )}`,
        exportSearchInfo
      );
      return;
    }

    if (!this.rowData || !this.rowData.length) {
      this.toastrMessage.showWarning("No data available to export");
      return;
    }
    this.excelExportService.generateExcelExportFile(
      this.reportCode,
      this.rowData,
      `${this.reportTitle.replace(/\s+/g, "_")}_${moment().format(
        "DD_MM_YYYY"
      )}`,
      exportSearchInfo,
      this.months
    );
  }

  print() {
    window.print();
  }
}
