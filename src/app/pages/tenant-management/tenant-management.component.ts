import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GridApi } from "ag-grid-community";
import { of } from "rxjs";
import { delay, catchError } from "rxjs/operators";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { PropertiesService } from "../properties/properties.service";
import { BuildingsService } from "../buildings/buildings.service";
import { UnitsService } from "../units/units.service";
import { TenantManagementService } from "./tenant-management.service";
import { TenantEditorComponent } from "./tenant-editor/tenant-editor.component";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { TenantAllotmentEditorComponent } from "./tenant-allotment-editor/tenant-allotment-editor.component";
import { RentReceiptEditorComponent } from "./rent-receipt-editor/rent-receipt-editor.component";
import { TenantLedgerPrintModalComponent } from "./tenant-ledger-print-modal/tenant-ledger-print-modal.component";
import { TenantChargesEditorComponent } from "./tenant-charges-editor/tenant-charges-editor.component";
import { ExcelService } from "../common/export-file.service";
import moment from "moment";

@Component({
  selector: "app-tenant-management",
  templateUrl: "./tenant-management.component.html",
})
export class TenantManagementComponent implements OnInit {
  isLoading: boolean;
  isShowLoadingSpinner: boolean = true;
  gridApi: GridApi;
  defaultColDef = { resizable: true };

  gridRowDataTenants = [];
  rowCount: number = 0;
  tenantId: number;
  tenantIdNew: number;
  selectedTenant: any = null;
  currentTabIndex: number = 0;

  allotmentGridApi: GridApi;
  serviceChargeGridApi: GridApi;
  gridRowDataTenantAllotment = [];
  selectedAllotment: any = null;
  selectedAllotmentId: number;
  gridRowDataServiceCharges = [];
  gridPinnedBottomRowDataServiceCharges = [];

  ledgerGridApi: GridApi;
  gridRowDataLedger = [];
  gridPinnedTopRowDataLedger = [];
  gridPinnedBottomRowDataLedger = [];
  isLedgerLoading: boolean = false;
  fromDateForLedgerTab: Date;
  toDateForLedgerTab: Date;

  securityLedgerGridApi: GridApi;
  gridRowDataSecurityLedger = [];
  gridPinnedTopRowDataSecurityLedger = [];
  gridPinnedBottomRowDataSecurityLedger = [];
  isSecurityLedgerLoading: boolean = false;
  fromDateForSecurityLedgerTab: Date;
  toDateForSecurityLedgerTab: Date;

  propertiesList = [];
  buildingsList = [];
  unitsList = [];

  searchOptionsList = [
    { id: "name", name: "Tenant Name" },
    { id: "regNo", name: "Registration Number" },
    { id: "mobileNo", name: "Mobile Number" },
    { id: "identityProofNumber", name: "ID Proof Number" },
  ];

  search: {
    selectedPropertyId: number;
    selectedBuildingId: number;
    selectedUnitId: number;
    status: string;
    searchOptionId: string;
    keyword: string;
  } = {
    selectedPropertyId: undefined,
    selectedBuildingId: undefined,
    selectedUnitId: undefined,
    status: undefined,
    searchOptionId: "name",
    keyword: "",
  };

  gridColumnDefsTenants = [
    {
      headerName: "Name",
      field: "name",
      width: 230,
      flex: 1,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      filter: true,
    },
    {
      headerName: "Action",
      field: "Action",
      width: 155,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.onEditTenantModal.bind(this),
        onDelete: this.onDeleteTenantModal.bind(this),
      },
    },
  ];

  gridColumnDefsTenantAllotment = [
    {
      headerName: "Property Name",
      field: "propertyName",
      width: 170,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Block",
      field: "buildingName",
      width: 130,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Alloted Unit",
      field: "unitNo",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Monthly Rent",
      field: "charges",
      width: 150,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
    },
    {
      headerName: "Allot Date",
      field: "allotDate",
      width: 180,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        if (params.data) {
          const from = params.data.allotmentFrom
            ? moment(params.data.allotmentFrom).format("DD/MM/YY")
            : "";
          const to = params.data.allotmentTo
            ? moment(params.data.allotmentTo).format("DD/MM/YY")
            : "";
          return from && to ? `${from} - ${to}` : from || "-";
        }
        return "-";
      },
    },
    {
      headerName: "Action",
      field: "Action",
      width: 160,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.openEditAllotmentModal.bind(this),
        onDelete: this.onDeleteAllotmentModal.bind(this),
      },
    },
  ];

  gridColumnDefsServiceCharges = [
    {
      headerName: "Service Name",
      field: "serviceName",
      width: 180,
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Category",
      field: "categoryName",
      width: 140,
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Amount",
      field: "chargeAmount",
      width: 150,
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Received Amount",
      field: "receivedAmount",
      width: 180,
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol;
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Balance",
      field: "balance",
      width: 130,
      type: "rightAligned",
      valueGetter: (params) => {
        return (
          (params.data?.netAmount || 0) - (params.data?.receivedAmount || 0)
        );
      },
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        if (val < 0) {
          return (
            "-" +
            sym +
            Math.abs(val).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
  ];

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  gridColumnDefsLedger = [
    {
      headerName: "Date",
      field: "date",
      width: 120,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      cellRenderer: (data) => {
        if (data.value) {
          return moment(data.value).format("DD-MM-YYYY");
        }
        return "";
      },
    },
    {
      headerName: "Particulars",
      width: 110,
      field: "particulars",
      sortable: true,
      cellStyle: (params) => {
        if (
          params.data?.date === null ||
          params.data?.particulars === "Opening" ||
          params.data?.particulars === "Total"
        ) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Rcpt No.",
      width: 120,
      field: "receiptNo",
      sortable: true,
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Due Amt.",
      width: 120,
      field: "dueAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Rcpt Amt.",
      width: 130,
      field: "receiptAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Balance",
      width: 120,
      field: "balanceAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        if (val < 0) {
          return (
            "-" +
            sym +
            Math.abs(val).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Mode",
      width: 100,
      field: "mode",
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
  ];

  gridColumnDefsSecurityLedger = [
    {
      headerName: "Date",
      field: "date",
      width: 120,
      sortable: true,
      sortingOrder: ["asc", "desc"],
      sort: "asc",
      cellRenderer: (data) => {
        if (data.value) {
          return moment(data.value).format("DD-MM-YYYY");
        }
        return "";
      },
    },
    {
      headerName: "Particulars",
      width: 110,
      field: "particulars",
      sortable: true,
      cellStyle: (params) => {
        if (
          params.data?.date === null ||
          params.data?.particulars === "Opening" ||
          params.data?.particulars === "Total"
        ) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Rcpt/Refund No.",
      width: 120,
      field: "refundNo",
      sortable: true,
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Due Amt.",
      width: 110,
      field: "dueAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Rcpt Amt.",
      width: 110,
      field: "receivedAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Refund Amt.",
      width: 110,
      field: "refundAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Balance",
      width: 110,
      field: "balanceAmount",
      type: "rightAligned",
      cellRenderer: (data) => {
        const sym = this.currencySymbol || "";
        const val = Number(data.value) || 0;
        if (val < 0) {
          return (
            "-" +
            sym +
            Math.abs(val).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
    {
      headerName: "Mode",
      width: 100,
      field: "mode",
      cellStyle: (params) => {
        if (params.data?.date === null) {
          return {
            "font-weight": "bold",
          };
        }
        return null;
      },
    },
  ];

  constructor(
    private title: Title,
    private modalService: BsModalService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    public authService: AuthService,
    private tenantService: TenantManagementService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private excelService: ExcelService
  ) {}

  ngOnInit() {
    this.title.setTitle("Tenant | PMS");
    this.initLedgerDates();
    this.initSecurityLedgerDates();
    this.loadFilterDropdowns();
    this.getTenants();
  }

  loadFilterDropdowns() {
    this.propertiesService.getProperties().subscribe({
      next: (response) => {
        if (response && (response.properties || []).length) {
          this.propertiesList = response.properties;
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  onPropertyChange() {
    this.search.selectedBuildingId = undefined;
    this.search.selectedUnitId = undefined;
    this.buildingsList = [];
    this.unitsList = [];

    if (this.search.selectedPropertyId) {
      this.buildingsService
        .getBuildings({ propertyId: this.search.selectedPropertyId })
        .subscribe({
          next: (response) => {
            if (response && (response.buildings || []).length) {
              this.buildingsList = response.buildings;
            }
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });

      this.unitsService
        .getUnits({ propertyId: this.search.selectedPropertyId })
        .subscribe({
          next: (response) => {
            if (response && (response.units || []).length) {
              this.unitsList = response.units;
            }
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  onBuildingChange() {
    this.search.selectedUnitId = undefined;
    this.unitsList = [];

    if (this.search.selectedBuildingId) {
      this.unitsService
        .getUnits({ buildingId: this.search.selectedBuildingId })
        .subscribe({
          next: (response) => {
            if (response && (response.units || []).length) {
              this.unitsList = response.units;
            }
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    } else if (this.search.selectedPropertyId) {
      this.unitsService
        .getUnits({ propertyId: this.search.selectedPropertyId })
        .subscribe({
          next: (response) => {
            if (response && (response.units || []).length) {
              this.unitsList = response.units;
            }
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  clearTenantDetails() {
    this.tenantId = undefined;
    this.tenantIdNew = undefined;
    this.selectedTenant = undefined;
    this.gridRowDataTenantAllotment = [];
    this.gridRowDataServiceCharges = [];
    this.gridPinnedBottomRowDataServiceCharges = [];
    this.gridRowDataLedger = [];
    this.gridPinnedTopRowDataLedger = [];
    this.gridPinnedBottomRowDataLedger = [];
    this.gridRowDataSecurityLedger = [];
    this.gridPinnedTopRowDataSecurityLedger = [];
    this.gridPinnedBottomRowDataSecurityLedger = [];
  }

  getTenants(selectedTenantId = this.tenantId) {
    this.isLoading = true;
    this.isShowLoadingSpinner = true;
    this.clearTenantDetails();
    this.tenantIdNew = selectedTenantId;
    this.gridApi?.showLoadingOverlay();
    this.gridRowDataTenants = [];
    this.rowCount = 0;

    const params: any = {};
    if (this.search.selectedPropertyId) {
      params.propertyId = this.search.selectedPropertyId;
    }
    if (this.search.selectedBuildingId) {
      params.buildingId = this.search.selectedBuildingId;
    }
    if (this.search.selectedUnitId) {
      params.unitId = this.search.selectedUnitId;
    }
    if (this.search.status && this.search.status !== "All") {
      params.status = this.search.status;
    }
    if (this.search.keyword) {
      params.searchField = this.search.searchOptionId;
      params.keyword = this.search.keyword;
    }

    this.tenantService.getTenants(params).subscribe({
      next: (resultGetTenants) => {
        this.gridApi?.hideOverlay();
        if (resultGetTenants && (resultGetTenants.tenants || []).length) {
          this.gridRowDataTenants = resultGetTenants.tenants;
          this.rowCount = this.gridRowDataTenants.length;
          const targetTenantId =
            selectedTenantId ||
            this.tenantIdNew ||
            this.gridRowDataTenants[0]?.id;
          this.tenantIdNew = targetTenantId;
          this.selectedTenantID();
        } else {
          this.gridApi?.showNoRowsOverlay();
          this.clearTenantDetails();
          this.toastrMessage.showWarning("No tenant records found");
          this.isShowLoadingSpinner = false;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.gridApi?.hideOverlay();
        this.isLoading = false;
        this.isShowLoadingSpinner = false;
        this.clearTenantDetails();
        this.errorHandlingService.errors(error);
      },
    });
  }

  onFirstDataRendered(event) {
    event.api?.sizeColumnsToFit();
    if ((this.gridRowDataTenants || []).length && !this.tenantIdNew) {
      this.gridApi.getDisplayedRowAtIndex(0)?.setSelected(true, true);
    }
  }

  selectedTenantID() {
    of(1)
      .pipe(delay(100))
      .subscribe({
        next: () => {
          let nodeToSelect;
          this.gridApi?.forEachNode((node) => {
            if (node.data?.id === this.tenantIdNew) {
              nodeToSelect = node;
            }
          });
          if (!nodeToSelect) {
            nodeToSelect = this.gridApi?.getDisplayedRowAtIndex(0);
          }
          if (nodeToSelect) {
            const nextTenantId = nodeToSelect.data?.id;
            this.tenantId = nextTenantId;
            this.tenantIdNew = this.tenantId;
            this.selectedTenant = nodeToSelect.data;
            nodeToSelect.setSelected(true, true);
            this.scrollToSelectedRow();
            if (this.currentTabIndex === 1) {
              this.getTenantAllotments(this.tenantId);
            } else if (this.currentTabIndex === 0) {
              this.getTenant(this.tenantId);
            } else if (this.currentTabIndex === 2) {
              this.isShowLoadingSpinner = true;
              this.checkingLedgerDetails();
            } else if (this.currentTabIndex === 3) {
              this.isShowLoadingSpinner = true;
              this.checkingSecurityLedgerDetails();
            } else {
              this.isShowLoadingSpinner = false;
            }
          } else {
            this.clearTenantDetails();
            this.isShowLoadingSpinner = false;
          }
        },
      });
  }

  scrollToSelectedRow() {
    let rows = [];
    let rowIndex: number = 0;
    this.gridApi.forEachNode((node) => {
      rows.push(node);
    });

    rows.filter((element) => {
      if (element.data.id === this.tenantIdNew) {
        rowIndex = element.rowIndex;
      }
    });

    this.gridApi.ensureIndexVisible(rowIndex, "middle");
  }

  onGridReady(params) {
    this.gridApi = params.api;
    if (this.isLoading) {
      this.gridApi.showLoadingOverlay();
    }
  }

  onFilterChanged(params) {
    this.rowCount = params.api?.getDisplayedRowCount();
  }

  onTenantSelectionChanged() {
    let rows = this.gridApi?.getSelectedRows();
    if (!rows || !rows.length) {
      this.clearTenantDetails();
      return;
    }
    const selectedTenant = rows[0];
    this.selectedTenant = selectedTenant;
    const selectedTenantId = selectedTenant.id;
    if (this.tenantId === selectedTenantId) {
      return;
    }
    this.tenantId = selectedTenantId;
    this.tenantIdNew = this.tenantId;

    if (this.currentTabIndex === 1) {
      this.getTenantAllotments(this.tenantId);
    } else if (this.currentTabIndex === 0) {
      this.getTenant(this.tenantId);
    } else if (this.currentTabIndex === 2) {
      this.isShowLoadingSpinner = true;
      this.checkingLedgerDetails();
    } else if (this.currentTabIndex === 3) {
      this.isShowLoadingSpinner = true;
      this.checkingSecurityLedgerDetails();
    } else {
      this.isShowLoadingSpinner = false;
    }
  }

  getTenant(tenantId: number) {
    if (!tenantId || !(this.gridRowDataTenants || []).length) {
      this.selectedTenant = undefined;
      this.isShowLoadingSpinner = false;
      return;
    }
    const params = {
      view: true,
    };
    this.isLoading = true;
    this.isShowLoadingSpinner = true;
    this.tenantService
      .getTenant(tenantId, params)
      .pipe(delay(300))
      .subscribe({
        next: (resultGetTenant) => {
          this.selectedTenant = resultGetTenant?.tenant;
          this.isLoading = false;
          this.isShowLoadingSpinner = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.isShowLoadingSpinner = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  selectTenant(tenant) {
    if (tenant?.id) {
      this.selectedTenant = tenant;
      if (this.tenantId === tenant.id) {
        return;
      }
      this.tenantId = tenant.id;
      this.tenantIdNew = tenant.id;
      if (this.currentTabIndex === 1) {
        this.isShowLoadingSpinner = true;
        this.getTenantAllotments(tenant.id);
      } else if (this.currentTabIndex === 0) {
        this.isShowLoadingSpinner = true;
        this.getTenant(tenant.id);
      } else if (this.currentTabIndex === 2) {
        this.isShowLoadingSpinner = true;
        this.checkingLedgerDetails();
      } else if (this.currentTabIndex === 3) {
        this.isShowLoadingSpinner = true;
        this.checkingSecurityLedgerDetails();
      } else {
        this.isShowLoadingSpinner = false;
      }
    }
  }

  selectTab(tabIndex: number) {
    if (tabIndex === this.currentTabIndex) {
      return;
    }
    this.currentTabIndex = tabIndex;
    const activeTenantId = this.selectedTenant?.id || this.tenantId;

    if (tabIndex === 1) {
      this.isShowLoadingSpinner = true;
      if (activeTenantId) {
        this.getTenantAllotments(activeTenantId);
      } else {
        this.isShowLoadingSpinner = false;
      }
    } else if (tabIndex === 0) {
      if (
        activeTenantId &&
        (!this.selectedTenant || this.selectedTenant.id !== activeTenantId)
      ) {
        this.isShowLoadingSpinner = true;
        this.getTenant(activeTenantId);
      } else {
        this.isShowLoadingSpinner = false;
      }
    } else if (tabIndex === 2) {
      this.isShowLoadingSpinner = true;
      if (activeTenantId) {
        this.checkingLedgerDetails();
      } else {
        this.isShowLoadingSpinner = false;
      }
    } else if (tabIndex === 3) {
      this.isShowLoadingSpinner = true;
      if (activeTenantId) {
        this.checkingSecurityLedgerDetails();
      } else {
        this.isShowLoadingSpinner = false;
      }
    } else {
      this.isShowLoadingSpinner = false;
    }
  }

  onAllotmentGridReady(params) {
    this.allotmentGridApi = params.api;
  }

  onAllotmentFirstDataRendered(params) {
    if ((this.gridRowDataTenantAllotment || []).length) {
      this.selectTargetAllotment(this.selectedAllotmentId);
    }
  }

  onServiceChargeGridReady(params) {
    this.serviceChargeGridApi = params.api;
  }

  onAllotmentSelectionChanged() {
    if (this.allotmentGridApi?.getSelectedRows().length) {
      const selectedRows = this.allotmentGridApi.getSelectedRows();
      if (this.selectedAllotment?.id === selectedRows[0].id) {
        return;
      }
      this.selectedAllotment = selectedRows[0];
      this.selectedAllotmentId = this.selectedAllotment?.id;
      this.populateServiceCharges(this.selectedAllotment);
    }
  }

  selectTargetAllotment(targetId?: number) {
    if (
      !this.gridRowDataTenantAllotment ||
      !this.gridRowDataTenantAllotment.length
    ) {
      this.selectedAllotment = null;
      this.selectedAllotmentId = undefined;
      this.gridRowDataServiceCharges = [];
      this.gridPinnedBottomRowDataServiceCharges = [];
      return;
    }

    of(1)
      .pipe(delay(100))
      .subscribe({
        next: () => {
          let nodeToSelect: any;
          if (this.allotmentGridApi) {
            if (targetId) {
              this.allotmentGridApi.forEachNode((node) => {
                if (node.data?.id === targetId) {
                  nodeToSelect = node;
                }
              });
            }
            if (!nodeToSelect) {
              nodeToSelect = this.allotmentGridApi.getDisplayedRowAtIndex(0);
            }
            if (nodeToSelect) {
              nodeToSelect.setSelected(true, true);
              if (
                nodeToSelect.rowIndex !== undefined &&
                nodeToSelect.rowIndex !== null
              ) {
                this.allotmentGridApi.ensureIndexVisible(
                  nodeToSelect.rowIndex,
                  "middle"
                );
              }
              this.selectedAllotment = nodeToSelect.data;
              this.selectedAllotmentId = this.selectedAllotment?.id;
              this.populateServiceCharges(this.selectedAllotment);
            }
          } else {
            const found = targetId
              ? (this.gridRowDataTenantAllotment || []).find(
                  (allotment) => allotment.id === targetId
                )
              : undefined;
            this.selectedAllotment =
              found || this.gridRowDataTenantAllotment[0];
            this.selectedAllotmentId = this.selectedAllotment?.id;
            this.populateServiceCharges(this.selectedAllotment);
          }
        },
      });
  }

  selectFirstAllotment() {
    this.selectTargetAllotment();
  }

  populateServiceCharges(allotment: any, receivedSoFar: number = 0) {
    if (!allotment) {
      this.gridRowDataServiceCharges = [];
      this.gridPinnedBottomRowDataServiceCharges = [];
      return;
    }

    let totalMonths = 1;
    if (allotment.allotmentFrom && allotment.allotmentTo) {
      const fromMoment = moment(allotment.allotmentFrom);
      const toMoment = moment(allotment.allotmentTo);
      if (fromMoment.isValid() && toMoment.isValid()) {
        totalMonths =
          (toMoment.year() - fromMoment.year()) * 12 +
          (toMoment.month() - fromMoment.month()) +
          1;
        if (totalMonths <= 0) totalMonths = 1;
        totalMonths = Math.min(totalMonths, 120);
      }
    }

    const baseRent = Number(allotment.charges) || 0;
    const serviceName = allotment.serviceName;
    const categoryName = allotment.categoryName;
    const rentCharge = baseRent * totalMonths;

    const chargesList = [];
    const receivedByHead = allotment.receivedByServiceHead || {};

    if (baseRent > 0 && serviceName) {
      const receivedAmount =
        Number(allotment.rentReceived ?? receivedByHead["rent"]) || 0;
      chargesList.push({
        serviceName: serviceName,
        categoryName: categoryName,
        chargeAmount: rentCharge,
        netAmount: rentCharge,
        receivedAmount: receivedAmount,
        balance: Math.max(0, rentCharge - receivedAmount),
      });
    }

    const securityAmount = Number(allotment.securityAmount) || 0;
    if (securityAmount > 0) {
      const securityReceived =
        Number(allotment.securityReceived ?? receivedByHead["security"]) || 0;
      chargesList.push({
        serviceName: "Security",
        categoryName: "Security",
        chargeAmount: securityAmount,
        netAmount: securityAmount,
        receivedAmount: securityReceived,
        balance: Math.max(0, securityAmount - securityReceived),
      });
    }

    (allotment.additionalCharges || []).forEach((additionalCharge) => {
      const defaultRate = Number(additionalCharge.chargeAmount) || 0;
      const multiplier = additionalCharge.type === "One Time" ? 1 : totalMonths;
      const chargeAmount = defaultRate * multiplier;
      const headKey = (additionalCharge.serviceName || "").trim().toLowerCase();
      const receivedAmount =
        Number(additionalCharge.receivedAmount ?? receivedByHead[headKey]) || 0;

      chargesList.push({
        serviceName: additionalCharge.serviceName,
        categoryName: additionalCharge.categoryName,
        chargeAmount: chargeAmount,
        netAmount: chargeAmount,
        receivedAmount: receivedAmount,
        balance: Math.max(0, chargeAmount - receivedAmount),
      });
    });

    const summary = this.generateFeeStructureSummary(chargesList);
    this.gridRowDataServiceCharges = summary.rowData;
    this.gridPinnedBottomRowDataServiceCharges = summary.totalRow;
  }

  generateFeeStructureSummary(chargesList: any[]) {
    let totalChargeAmount = 0;
    let totalNetAmount = 0;
    let totalReceivedAmount = 0;

    chargesList.forEach((chargeItem) => {
      const chargeAmount = Number(chargeItem.chargeAmount) || 0;
      const netAmount = chargeAmount;
      const receivedAmount = Number(chargeItem.receivedAmount) || 0;
      chargeItem.netAmount = netAmount;
      chargeItem.balance = netAmount - receivedAmount;

      totalChargeAmount += chargeAmount;
      totalNetAmount += netAmount;
      totalReceivedAmount += receivedAmount;
    });

    const totalRow = [
      {
        serviceName: "Total",
        categoryName: "",
        chargeAmount: totalChargeAmount,
        netAmount: totalNetAmount,
        receivedAmount: totalReceivedAmount,
        balance: totalNetAmount - totalReceivedAmount,
        isTotalRow: true,
      },
    ];

    return { rowData: chargesList, totalRow };
  }

  getTenantAllotments(tenantId: number, targetAllotmentId?: number) {
    if (!tenantId) {
      this.gridRowDataTenantAllotment = [];
      this.gridRowDataServiceCharges = [];
      this.gridPinnedBottomRowDataServiceCharges = [];
      this.selectedAllotment = null;
      this.selectedAllotmentId = undefined;
      this.isShowLoadingSpinner = false;
      return;
    }
    const targetId = targetAllotmentId || this.selectedAllotmentId;
    this.isShowLoadingSpinner = true;
    this.tenantService
      .getAllotments(tenantId)
      .pipe(delay(500))
      .subscribe({
        next: (response) => {
          if (response && (response.allotments || []).length) {
            this.gridRowDataTenantAllotment = response.allotments;
            this.selectTargetAllotment(targetId);
          } else {
            this.gridRowDataTenantAllotment = [];
            this.gridRowDataServiceCharges = [];
            this.gridPinnedBottomRowDataServiceCharges = [];
            this.selectedAllotment = null;
            this.selectedAllotmentId = undefined;
            if (!document.getElementsByClassName("modal").length) {
              this.toastrMessage.showWarning("No allotment records found");
            }
          }
          this.isShowLoadingSpinner = false;
        },
        error: (error) => {
          this.errorHandlingService.errors(error);
          this.gridRowDataTenantAllotment = [];
          this.gridRowDataServiceCharges = [];
          this.gridPinnedBottomRowDataServiceCharges = [];
          this.selectedAllotment = null;
          this.selectedAllotmentId = undefined;
          this.isShowLoadingSpinner = false;
        },
      });
  }

  openNewAllotmentModal(targetTenantId?: number) {
    const tenant =
      (this.gridApi?.getSelectedRows() || [])[0] || this.selectedTenant;
    const tenantId = targetTenantId || tenant?.id;
    if (!tenantId) {
      this.toastrMessage.showWarning("Please select a tenant first");
      return;
    }
    if (!targetTenantId && tenant?.status === "Inactive") {
      this.toastrMessage.showWarning(
        "Selected Tenant is Inactive so new Allotment can not be possible"
      );
      return;
    }
    const bsModalRef: BsModalRef = this.modalService.show(
      TenantAllotmentEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formState: "NEW",
          tenantId: tenantId,
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          const newId =
            typeof result === "object" && result.allotment?.id
              ? result.allotment.id
              : undefined;
          if (newId) {
            this.selectedAllotmentId = newId;
          }
          if (this.tenantId !== tenantId) {
            this.getTenants(tenantId);
          } else {
            this.getTenantAllotments(tenantId, newId);
          }
        }
        subscription.unsubscribe();
      },
    });
  }

  openEditAllotmentModal(params) {
    const allotmentId = params?.id;
    if (!allotmentId) {
      this.toastrMessage.showWarning("Please select an allotment to edit");
      return;
    }
    this.selectedAllotmentId = allotmentId;
    const tenant =
      (this.gridApi?.getSelectedRows() || [])[0] || this.selectedTenant;
    const tenantId = tenant?.id;
    const bsModalRef: BsModalRef = this.modalService.show(
      TenantAllotmentEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formState: "EDIT",
          tenantId: tenantId,
          tenantName: tenant?.name,
          allotmentEditId: allotmentId,
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          const updatedId =
            typeof result === "object" && result.allotment?.id
              ? result.allotment.id
              : allotmentId;
          this.selectedAllotmentId = updatedId;
          if (tenantId) {
            this.getTenantAllotments(tenantId, updatedId);
          }
        }
        subscription.unsubscribe();
      },
    });
  }

  onDeleteAllotmentModal(data) {
    const allotment = data?.data || data;
    if (!allotment) {
      return;
    }
    let name: string;
    this.gridRowDataTenantAllotment.find((allotmentItem) => {
      if (allotmentItem.id === allotment.id) {
        name = allotmentItem.unitNo
          ? `Unit ${allotmentItem.unitNo}`
          : allotmentItem.propertyName;
      }
    });

    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the allotment record`,
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.tenantService.deleteAllotment(allotment.id).subscribe({
            next: () => {
              if (this.selectedTenant) {
                this.getTenantAllotments(this.selectedTenant.id);
              }
              this.toastrMessage.showSuccessMessage("Allotment Record Deleted");
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

  onFeeReceipt() {
    if (!this.selectedTenant) {
      this.toastrMessage.showWarning("Please select a tenant first");
      return;
    }
    if (!this.selectedAllotment && this.gridRowDataTenantAllotment.length) {
      this.selectedAllotment = this.gridRowDataTenantAllotment[0];
    }
    const bsModalRef: BsModalRef = this.modalService.show(
      RentReceiptEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          tenant: this.selectedTenant,
          allotment: this.selectedAllotment,
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          if (this.selectedTenant) {
            this.getTenantAllotments(this.selectedTenant.id);
          }
        }
        subscription.unsubscribe();
      },
    });
  }

  openRentReceiptModal() {
    this.onFeeReceipt();
  }

  openTenantChargesEditorModal() {
    if (!this.selectedTenant) {
      this.toastrMessage.showWarning("Please select a tenant first");
      return;
    }
    if (
      !this.selectedAllotment &&
      (this.gridRowDataTenantAllotment || []).length
    ) {
      this.selectedAllotment = this.gridRowDataTenantAllotment[0];
    }
    if (!this.selectedAllotment) {
      this.toastrMessage.showWarning("Please select an allotment record first");
      return;
    }

    this.modalService.show(TenantChargesEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
      initialState: {
        tenant: this.selectedTenant,
        allotment: this.selectedAllotment,
      },
    });
  }

  openNewTenantModal() {
    const bsModalRef: BsModalRef = this.modalService.show(
      TenantEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formState: "NEW",
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result) => {
        if (result) {
          const tenantId =
            typeof result === "object" ? result.tenantId : undefined;
          this.tenantIdNew = tenantId;
          this.getTenants(tenantId);
          if (tenantId && result.status !== "Inactive") {
            this.openNewAllotmentModal(tenantId);
          }
        }
        subscription.unsubscribe();
      },
    });
  }

  onEditTenantModal(data) {
    const bsModalRef = this.modalService.show(TenantEditorComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-xl",
      initialState: {
        formState: "EDIT",
        tenantEditId: data.id,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          const tenantId =
            typeof result === "object" ? result.tenantId : data.id;
          this.tenantIdNew = tenantId;
          this.getTenants(tenantId);
        }
        subscription.unsubscribe();
      },
    });
  }

  onDeleteTenantModal(data) {
    let name: string;
    this.gridRowDataTenants.find((tenant) => {
      if (tenant.id === data.id) {
        name = tenant.name;
      }
    });

    if (!name) {
      return;
    }

    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to remove the tenant?`,
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.tenantService.delete(data.id).subscribe({
            next: () => {
              if (this.tenantId === data.id) {
                this.tenantId = undefined;
                this.tenantIdNew = undefined;
                this.selectedTenant = undefined;
              }
              this.getTenants();
              this.toastrMessage.showSuccessMessage("Tenant Deleted");
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

  initLedgerDates() {
    this.fromDateForLedgerTab = moment().startOf("year").toDate();
    this.toDateForLedgerTab = moment().toDate();
  }

  onLedgerGridReady(params) {
    this.ledgerGridApi = params.api;
  }

  checkingLedgerDetails() {
    this.gridRowDataLedger = [];
    this.gridPinnedTopRowDataLedger = [];
    this.gridPinnedBottomRowDataLedger = [];

    const activeTenantId = this.selectedTenant?.id || this.tenantId;
    if (!activeTenantId) {
      this.isShowLoadingSpinner = false;
      return;
    }

    const params = {
      fromDate: this.fromDateForLedgerTab
        ? moment(this.fromDateForLedgerTab).format("YYYY-MM-DD")
        : undefined,
      toDate: this.toDateForLedgerTab
        ? moment(this.toDateForLedgerTab).format("YYYY-MM-DD")
        : undefined,
    };

    if (
      params.fromDate === undefined ||
      params.toDate === undefined ||
      params.fromDate === "Invalid date" ||
      params.toDate === "Invalid date"
    ) {
      this.gridRowDataLedger = [];
      this.gridPinnedBottomRowDataLedger = [];
      this.gridPinnedTopRowDataLedger = [];
      this.isShowLoadingSpinner = false;
      return this.toastrMessage.showWarning("Please enter a valid date");
    }

    if (params.fromDate > params.toDate) {
      this.gridRowDataLedger = [];
      this.gridPinnedBottomRowDataLedger = [];
      this.gridPinnedTopRowDataLedger = [];
      this.isShowLoadingSpinner = false;
      return this.toastrMessage.showWarning(
        "To Date should not be less than From Date."
      );
    }

    this.getTenantLedgerDetail(activeTenantId, params);
  }

  getTenantLedgerDetail(tenantId: number, params: any) {
    this.isLedgerLoading = true;
    this.isShowLoadingSpinner = true;
    this.gridRowDataLedger = [];
    this.gridPinnedTopRowDataLedger = [];
    this.gridPinnedBottomRowDataLedger = [];

    this.tenantService
      .getTenantLedger(tenantId, params)
      .pipe(
        delay(500),
        catchError(() => {
          return of({ openingAmount: 0, ledger: [] }).pipe(delay(500));
        })
      )
      .subscribe({
        next: (resultGetTenantLedgerDetail) => {
          if (resultGetTenantLedgerDetail) {
            const records = resultGetTenantLedgerDetail.ledger || [];
            const opening =
              Number(resultGetTenantLedgerDetail.openingAmount) || 0;
            if (records.length || opening !== 0) {
              const summary = this.generateLedgerSummary(opening, records);
              this.gridPinnedTopRowDataLedger = summary.openingAmountObject;
              this.gridRowDataLedger = summary.rowData;
              this.gridPinnedBottomRowDataLedger = summary.totalRow;
            } else {
              this.gridPinnedTopRowDataLedger = [];
              this.gridRowDataLedger = [];
              this.gridPinnedBottomRowDataLedger = [];
            }
          }
          this.isLedgerLoading = false;
          this.isShowLoadingSpinner = false;
        },
        error: (error) => {
          this.isLedgerLoading = false;
          this.isShowLoadingSpinner = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  generateLedgerSummary(openingAmount: number = 0, records: any[] = []) {
    let totalObject = [];
    let openingAmountObject = [];
    let balanceAmount = Number(openingAmount) || 0;
    let total = {
      dueAmount: 0,
      receiptAmount: 0,
    };

    let mappedRecords = (records || []).map((record) => {
      const dueAmt = Number(record.dueAmount) || 0;
      const rcptAmt = Number(record.receiptAmount) || 0;
      total.dueAmount += dueAmt;
      total.receiptAmount += rcptAmt;
      balanceAmount += dueAmt - rcptAmt;
      return {
        date: record.date,
        particulars: record.particulars,
        receiptNo: record.receiptNo,
        dueAmount: dueAmt,
        receiptAmount: rcptAmt,
        balanceAmount: balanceAmount,
        mode: record.mode,
      };
    });

    const openingDueAmount =
      Number(openingAmount) > 0 ? Number(openingAmount) : 0;
    const openingReceiptAmount =
      Number(openingAmount) < 0 ? Math.abs(Number(openingAmount)) : 0;

    openingAmountObject.push({
      date: null,
      particulars: "Opening",
      receiptNo: "",
      dueAmount: openingDueAmount,
      receiptAmount: openingReceiptAmount,
      balanceAmount: Number(openingAmount) || 0,
      mode: "",
    });

    totalObject.push({
      date: null,
      particulars: "Total",
      receiptNo: "",
      dueAmount: total.dueAmount + openingDueAmount,
      receiptAmount: total.receiptAmount + openingReceiptAmount,
      balanceAmount:
        (Number(openingAmount) || 0) + total.dueAmount - total.receiptAmount,
      mode: "",
    });

    return {
      rowData: mappedRecords,
      totalRow: totalObject,
      openingAmountObject: openingAmountObject,
    };
  }

  exportTenantLedger() {
    let excelFeeArr = [];
    (this.gridPinnedTopRowDataLedger || []).forEach((data) => {
      excelFeeArr.push(data);
    });
    if (this.ledgerGridApi) {
      this.ledgerGridApi.forEachNodeAfterFilterAndSort((node) => {
        excelFeeArr.push(node.data);
      });
    } else {
      (this.gridRowDataLedger || []).forEach((row) => {
        excelFeeArr.push(row);
      });
    }
    (this.gridPinnedBottomRowDataLedger || []).forEach((data) => {
      excelFeeArr.push(data);
    });

    let excelFileRecord = [];
    const dateFormat = "DD-MM-YYYY";

    excelFeeArr.forEach((feeData, index) => {
      excelFileRecord.push({
        "Sr No.":
          feeData.particulars === "Total" || feeData.particulars === "Opening"
            ? ""
            : index,
        Date: feeData.date ? moment(feeData.date).format(dateFormat) : "",
        Particulars: feeData.particulars || "",
        "Rcpt No.": feeData.receiptNo || "",
        "Due Amount": feeData.dueAmount ? Number(feeData.dueAmount) : 0,
        "Receipt Amount": feeData.receiptAmount
          ? Number(feeData.receiptAmount)
          : 0,
        Balance: feeData.balanceAmount ? Number(feeData.balanceAmount) : 0,
        Mode: feeData.mode || "",
      });
    });

    const safeName = (this.selectedTenant?.name || "Tenant").replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );
    this.excelService.exportAsExcelFile(excelFileRecord, `${safeName}_ledger`);
  }

  printTenantLedger() {
    const activeTenantId = this.selectedTenant?.id;
    if (!activeTenantId) {
      this.toastrMessage.showWarning("Please select a tenant first");
      return;
    }

    const existingAllotment =
      this.selectedAllotment ||
      (this.gridRowDataTenantAllotment && this.gridRowDataTenantAllotment[0]);

    if (existingAllotment) {
      this.openTenantLedgerPrintModal(existingAllotment);
    } else {
      this.tenantService.getAllotments(activeTenantId).subscribe({
        next: (response) => {
          const allotments = response?.allotments || [];
          this.gridRowDataTenantAllotment = allotments;
          this.openTenantLedgerPrintModal(allotments[0] || null);
        },
        error: () => {
          this.openTenantLedgerPrintModal(null);
        },
      });
    }
  }

  openTenantLedgerPrintModal(allotment) {
    const openingRow = (this.gridPinnedTopRowDataLedger || [])[0] || null;
    const totalRow = (this.gridPinnedBottomRowDataLedger || [])[0] || null;

    this.modalService.show(TenantLedgerPrintModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: true,
      class: "modal-xl modal-dialog-centered",
      initialState: {
        tenant: this.selectedTenant,
        allotment: allotment,
        fromDate: this.fromDateForLedgerTab,
        toDate: this.toDateForLedgerTab,
        openingRow: openingRow,
        ledgerRows: this.gridRowDataLedger || [],
        totalRow: totalRow,
      },
    });
  }

  initSecurityLedgerDates() {
    this.fromDateForSecurityLedgerTab = moment().startOf("year").toDate();
    this.toDateForSecurityLedgerTab = moment().toDate();
  }

  onSecurityLedgerGridReady(params) {
    this.securityLedgerGridApi = params.api;
  }

  checkingSecurityLedgerDetails() {
    this.gridRowDataSecurityLedger = [];
    this.gridPinnedTopRowDataSecurityLedger = [];
    this.gridPinnedBottomRowDataSecurityLedger = [];

    const activeTenantId = this.selectedTenant?.id || this.tenantId;
    if (!activeTenantId) {
      this.isShowLoadingSpinner = false;
      return;
    }

    const params = {
      fromDate: this.fromDateForSecurityLedgerTab
        ? moment(this.fromDateForSecurityLedgerTab).format("YYYY-MM-DD")
        : undefined,
      toDate: this.toDateForSecurityLedgerTab
        ? moment(this.toDateForSecurityLedgerTab).format("YYYY-MM-DD")
        : undefined,
    };

    if (
      params.fromDate === undefined ||
      params.toDate === undefined ||
      params.fromDate === "Invalid date" ||
      params.toDate === "Invalid date"
    ) {
      this.gridRowDataSecurityLedger = [];
      this.gridPinnedBottomRowDataSecurityLedger = [];
      this.gridPinnedTopRowDataSecurityLedger = [];
      this.isShowLoadingSpinner = false;
      return this.toastrMessage.showWarning("Please enter a valid date");
    }

    if (params.fromDate > params.toDate) {
      this.gridRowDataSecurityLedger = [];
      this.gridPinnedBottomRowDataSecurityLedger = [];
      this.gridPinnedTopRowDataSecurityLedger = [];
      this.isShowLoadingSpinner = false;
      return this.toastrMessage.showWarning(
        "To Date should not be less than From Date."
      );
    }

    this.getTenantSecurityLedgerDetail(activeTenantId, params);
  }

  getTenantSecurityLedgerDetail(tenantId: number, params: any) {
    this.isSecurityLedgerLoading = true;
    this.isShowLoadingSpinner = true;
    this.gridRowDataSecurityLedger = [];
    this.gridPinnedTopRowDataSecurityLedger = [];
    this.gridPinnedBottomRowDataSecurityLedger = [];

    this.tenantService
      .getTenantSecurityLedger(tenantId, params)
      .pipe(
        delay(500),
        catchError(() => {
          return of({ openingAmount: 0, ledger: [] }).pipe(delay(500));
        })
      )
      .subscribe({
        next: (resultGetTenantSecurityLedgerDetail) => {
          if (resultGetTenantSecurityLedgerDetail) {
            const records = resultGetTenantSecurityLedgerDetail.ledger || [];
            const opening =
              Number(resultGetTenantSecurityLedgerDetail.openingAmount) || 0;
            if (records.length || opening !== 0) {
              const summary = this.generateSecurityLedgerSummary(
                opening,
                records
              );
              this.gridPinnedTopRowDataSecurityLedger =
                summary.openingAmountObject;
              this.gridRowDataSecurityLedger = summary.rowData;
              this.gridPinnedBottomRowDataSecurityLedger = summary.totalRow;
            } else {
              this.gridPinnedTopRowDataSecurityLedger = [];
              this.gridRowDataSecurityLedger = [];
              this.gridPinnedBottomRowDataSecurityLedger = [];
            }
          }
          this.isSecurityLedgerLoading = false;
          this.isShowLoadingSpinner = false;
        },
        error: (error) => {
          this.isSecurityLedgerLoading = false;
          this.isShowLoadingSpinner = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  generateSecurityLedgerSummary(
    openingAmount: number = 0,
    records: any[] = []
  ) {
    let totalObject = [];
    let openingAmountObject = [];
    let balanceAmount = Number(openingAmount) || 0;
    let total = {
      dueAmount: 0,
      receivedAmount: 0,
      refundAmount: 0,
    };

    let mappedRecords = (records || []).map((record) => {
      const dueAmt = Number(record.dueAmount) || 0;
      const recAmt = Number(record.receivedAmount) || 0;
      const refAmt = Number(record.refundAmount) || 0;
      total.dueAmount += dueAmt;
      total.receivedAmount += recAmt;
      total.refundAmount += refAmt;
      balanceAmount += dueAmt - recAmt + refAmt;
      return {
        date: record.date,
        particulars: record.particulars,
        refundNo: record.refundNo || record.receiptNo || "",
        dueAmount: dueAmt,
        receivedAmount: recAmt,
        refundAmount: refAmt,
        balanceAmount: balanceAmount,
        mode: record.mode || "",
      };
    });

    const openingDueAmount =
      Number(openingAmount) > 0 ? Number(openingAmount) : 0;
    const openingCreditAmount =
      Number(openingAmount) < 0 ? Math.abs(Number(openingAmount)) : 0;

    openingAmountObject.push({
      date: null,
      particulars: "Opening",
      refundNo: "",
      dueAmount: openingDueAmount,
      receivedAmount: 0,
      refundAmount: openingCreditAmount,
      balanceAmount: Number(openingAmount) || 0,
      mode: "",
    });

    totalObject.push({
      date: null,
      particulars: "Total",
      refundNo: "",
      dueAmount: total.dueAmount + openingDueAmount,
      receivedAmount: total.receivedAmount,
      refundAmount: total.refundAmount + openingCreditAmount,
      balanceAmount:
        (Number(openingAmount) || 0) +
        total.dueAmount -
        total.receivedAmount +
        total.refundAmount,
      mode: "",
    });

    return {
      rowData: mappedRecords,
      totalRow: totalObject,
      openingAmountObject: openingAmountObject,
    };
  }

  exportTenantSecurityLedger() {
    let excelFeeArr = [];
    (this.gridPinnedTopRowDataSecurityLedger || []).forEach((data) => {
      excelFeeArr.push(data);
    });
    if (this.securityLedgerGridApi) {
      this.securityLedgerGridApi.forEachNodeAfterFilterAndSort((node) => {
        excelFeeArr.push(node.data);
      });
    } else {
      (this.gridRowDataSecurityLedger || []).forEach((row) => {
        excelFeeArr.push(row);
      });
    }
    (this.gridPinnedBottomRowDataSecurityLedger || []).forEach((data) => {
      excelFeeArr.push(data);
    });

    let excelFileRecord = [];
    const dateFormat = "DD-MM-YYYY";

    excelFeeArr.forEach((feeData, index) => {
      excelFileRecord.push({
        "Sr No.":
          feeData.particulars === "Total" || feeData.particulars === "Opening"
            ? ""
            : index,
        Date: feeData.date ? moment(feeData.date).format(dateFormat) : "",
        Particulars: feeData.particulars || "",
        "Rcpt / Refund No.": feeData.refundNo || "",
        "Due Amount": feeData.dueAmount ? Number(feeData.dueAmount) : 0,
        "Rcpt Amount": feeData.receivedAmount
          ? Number(feeData.receivedAmount)
          : 0,
        "Refund Amount": feeData.refundAmount
          ? Number(feeData.refundAmount)
          : 0,
        Balance: feeData.balanceAmount ? Number(feeData.balanceAmount) : 0,
        Mode: feeData.mode || "",
      });
    });

    const safeName = (this.selectedTenant?.name || "Tenant").replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );
    this.excelService.exportAsExcelFile(
      excelFileRecord,
      `${safeName}_security_ledger`
    );
  }

  printTenantSecurityLedger() {
    const activeTenantId = this.selectedTenant?.id;
    if (!activeTenantId) {
      this.toastrMessage.showWarning("Please select a tenant first");
      return;
    }

    const existingAllotment =
      this.selectedAllotment ||
      (this.gridRowDataTenantAllotment && this.gridRowDataTenantAllotment[0]);

    if (existingAllotment) {
      this.openTenantSecurityLedgerPrintModal(existingAllotment);
    } else {
      this.tenantService.getAllotments(activeTenantId).subscribe({
        next: (response) => {
          const allotments = response?.allotments || [];
          this.gridRowDataTenantAllotment = allotments;
          this.openTenantSecurityLedgerPrintModal(allotments[0] || null);
        },
        error: () => {
          this.openTenantSecurityLedgerPrintModal(null);
        },
      });
    }
  }

  openTenantSecurityLedgerPrintModal(allotment) {
    const openingRow =
      (this.gridPinnedTopRowDataSecurityLedger || [])[0] || null;
    const totalRow =
      (this.gridPinnedBottomRowDataSecurityLedger || [])[0] || null;

    this.modalService.show(TenantLedgerPrintModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: true,
      class: "modal-xl modal-dialog-centered",
      initialState: {
        tenant: this.selectedTenant,
        allotment: allotment,
        fromDate: this.fromDateForSecurityLedgerTab,
        toDate: this.toDateForSecurityLedgerTab,
        openingRow: openingRow,
        ledgerRows: this.gridRowDataSecurityLedger || [],
        totalRow: totalRow,
        ledgerType: "SECURITY",
      },
    });
  }
}
