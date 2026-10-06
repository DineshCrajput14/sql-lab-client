import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { FeeReceiptsService } from "./fee-receipts.service";
import { PropertiesService } from "../properties/properties.service";
import { BuildingsService } from "../buildings/buildings.service";
import { UnitsService } from "../units/units.service";
import { RentReceiptEditorComponent } from "../tenant-management/rent-receipt-editor/rent-receipt-editor.component";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";
import { PrintEditDeleteRendererComponent } from "../common/renderer/print-edit-delete-rendered.component";
import { FeeReceiptPrintModalComponent } from "./fee-receipt-print-modal/fee-receipt-print-modal.component";
import { AuthService } from "src/app/utils/services/auth.service";
import { of } from "rxjs";
import { delay } from "rxjs/operators";

@Component({
  selector: "app-fee-receipts",
  templateUrl: "./fee-receipts.component.html",
  styleUrls: ["./fee-receipts.component.scss"],
})
export class FeeReceiptsComponent implements OnInit {
  isLoading: boolean = false;
  receiptGridApi: GridApi;
  detailGridApi: GridApi;
  defaultColDef = { resizable: true };

  gridRowDataReceipts = [];
  gridRowDataDetails = [];
  pinnedBottomRowDataDetails = [];
  selectedReceipt: any = null;

  propertiesList = [];
  buildingsList = [];
  unitsList = [];

  searchOptionsList = [
    { id: "all", name: "All" },
    { id: "tenantName", name: "Tenant Name" },
    { id: "receiptNo", name: "Receipt Number" },
    { id: "regNo", name: "Registration Number" },
  ];

  get searchOptions() {
    return this.searchOptionsList;
  }

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  search: {
    propertyId: number;
    buildingId: number;
    unitId: number;
    fromDate: Date | string;
    toDate: Date | string;
    searchField: string;
    keyword: string;
  } = {
    propertyId: undefined,
    buildingId: undefined,
    unitId: undefined,
    fromDate: moment().toDate(),
    toDate: moment().toDate(),
    searchField: "all",
    keyword: "",
  };

  columnDefsReceipts = [
    {
      headerName: "Receipt Date",
      field: "receiptDate",
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Receipt No.",
      field: "receiptNo",
      width: 120,
      sortable: true,
      filter: true,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Reg. No",
      field: "regNo",
      width: 110,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Tenant Name",
      field: "tenantName",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Unit No",
      field: "unitNo",
      width: 110,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Total Receivable",
      field: "totalReceivable",
      width: 130,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
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
      headerName: "Received",
      field: "receivedAmount",
      width: 130,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
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
      headerName: "Balance",
      field: "balance",
      width: 120,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
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
    },
    {
      headerName: "Mode",
      field: "receiptMode",
      width: 120,
      sortable: true,
      filter: true,
      tooltipField: "receiptMode",
    },
    {
      headerName: "Action",
      field: "Action",
      width: 220,
      cellRendererFramework: PrintEditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editFeeReceipt.bind(this),
        onPrint: this.onPrintReceipt.bind(this),
        onDelete: this.onDeleteReceipt.bind(this),
      },
    },
  ];

  columnDefsDetails = [
    {
      headerName: "Due Date",
      field: "dueDate",
      width: 120,
      sortable: true,
      cellRenderer: (params) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Head",
      field: "serviceName",
      width: 130,
      sortable: true,
      cellStyle: (params) => {
        if (params.data?.isTotalRow || params.node?.rowPinned === "bottom") {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Due",
      field: "dueAmount",
      width: 130,
      type: "rightAligned",
      cellRenderer: (params) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow || params.node?.rowPinned === "bottom") {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Received",
      field: "receivedAmount",
      width: 110,
      type: "rightAligned",
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow || params.node?.rowPinned === "bottom") {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
  ];

  constructor(
    private feeReceiptsService: FeeReceiptsService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private modalService: BsModalService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.getProperties();
    this.getFeeReceipts();
  }

  getProperties() {
    this.propertiesService.getProperties().subscribe({
      next: (response) => {
        this.propertiesList = response?.properties || [];
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  onPropertyChange() {
    this.search.buildingId = undefined;
    this.search.unitId = undefined;
    this.buildingsList = [];
    this.unitsList = [];

    if (this.search.propertyId) {
      this.buildingsService
        .getBuildings({ propertyId: this.search.propertyId })
        .subscribe({
          next: (response) => {
            this.buildingsList = response?.buildings || [];
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
      this.unitsService
        .getUnits({ propertyId: this.search.propertyId })
        .subscribe({
          next: (response) => {
            this.unitsList = response?.units || [];
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  onBuildingChange() {
    this.search.unitId = undefined;
    this.unitsList = [];

    if (this.search.buildingId) {
      this.unitsService
        .getUnits({ buildingId: this.search.buildingId })
        .subscribe({
          next: (response) => {
            this.unitsList = response?.units || [];
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  getFeeReceipts(selectReceiptId?: number) {
    this.isLoading = true;
    this.selectedReceipt = null;
    this.gridRowDataDetails = [];
    this.pinnedBottomRowDataDetails = [];
    this.receiptGridApi?.deselectAll();
    if (this.detailGridApi) {
      this.detailGridApi.setPinnedBottomRowData([]);
      this.detailGridApi.showNoRowsOverlay();
    }

    const params: any = {};
    if (this.search.propertyId) {
      params.propertyId = this.search.propertyId;
    }
    if (this.search.buildingId) {
      params.buildingId = this.search.buildingId;
    }
    if (this.search.unitId) {
      params.unitId = this.search.unitId;
    }
    if (this.search.fromDate) {
      params.fromDate = moment(this.search.fromDate).format("YYYY-MM-DD");
    }
    if (this.search.toDate) {
      params.toDate = moment(this.search.toDate).format("YYYY-MM-DD");
    }
    if (this.search.keyword && this.search.keyword.trim()) {
      params.keyword = this.search.keyword.trim();
      params.searchField = this.search.searchField;
    }

    this.feeReceiptsService.getFeeReceipts(params).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.gridRowDataReceipts = response?.rentReceipts || [];
        if (!this.gridRowDataReceipts.length) {
          this.receiptGridApi?.showNoRowsOverlay();
          this.gridRowDataDetails = [];
          this.pinnedBottomRowDataDetails = [];
          this.selectedReceipt = null;
          if (this.detailGridApi) {
            this.detailGridApi.setPinnedBottomRowData([]);
            this.detailGridApi.showNoRowsOverlay();
          }
          this.toastrMessage.showWarning("No Rent receipt records found");
        } else {
          this.receiptGridApi?.hideOverlay();
          of(1)
            .pipe(delay(50))
            .subscribe(() => {
              let targetIndex = 0;
              if (selectReceiptId) {
                const foundIdx = this.gridRowDataReceipts.findIndex(
                  (feeReceipt: any) => feeReceipt.id === selectReceiptId
                );
                if (foundIdx !== -1) {
                  targetIndex = foundIdx;
                }
              }
              const node = this.receiptGridApi?.getDisplayedRowAtIndex(
                targetIndex
              );
              if (node) {
                node.setSelected(true, true);
              }
            });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.gridRowDataReceipts = [];
        this.gridRowDataDetails = [];
        this.pinnedBottomRowDataDetails = [];
        this.selectedReceipt = null;
        if (this.detailGridApi) {
          this.detailGridApi.setPinnedBottomRowData([]);
          this.detailGridApi.showNoRowsOverlay();
        }
        this.errorHandlingService.errors(error);
      },
    });
  }

  onReceiptGridReady(params) {
    this.receiptGridApi = params.api;
  }

  onDetailGridReady(params) {
    this.detailGridApi = params.api;
  }

  onReceiptFirstDataRendered(params) {
    if (this.gridRowDataReceipts && this.gridRowDataReceipts.length > 0) {
      of(1)
        .pipe(delay(50))
        .subscribe(() => {
          const firstNode = this.receiptGridApi?.getDisplayedRowAtIndex(0);
          if (firstNode) {
            firstNode.setSelected(true, true);
          }
        });
    }
  }

  onReceiptSelectionChanged() {
    if (!this.receiptGridApi) {
      return;
    }
    const selectedRows = this.receiptGridApi.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      this.selectedReceipt = selectedRows[0];
      this.getFeeReceiptDetails(this.selectedReceipt.id);
    } else {
      this.selectedReceipt = null;
      this.gridRowDataDetails = [];
      this.pinnedBottomRowDataDetails = [];
      if (this.detailGridApi) {
        this.detailGridApi.setPinnedBottomRowData([]);
        this.detailGridApi.showNoRowsOverlay();
      }
    }
  }

  getFeeReceiptDetails(receiptId?: number) {
    const id = receiptId || this.selectedReceipt?.id;
    if (!id) {
      this.gridRowDataDetails = [];
      this.pinnedBottomRowDataDetails = [];
      if (this.detailGridApi) {
        this.detailGridApi.setPinnedBottomRowData([]);
        this.detailGridApi.showNoRowsOverlay();
      }
      return;
    }
    this.feeReceiptsService.getFeeReceipt(id).subscribe({
      next: (response) => {
        const receipt = response?.rentReceipt;
        const details = receipt?.details || [];
        this.gridRowDataDetails = details;
        if (details.length) {
          const totalDue = details.reduce(
            (sum: number, detail: any) => sum + (Number(detail.dueAmount) || 0),
            0
          );
          const totalReceived = details.reduce(
            (sum: number, detail: any) =>
              sum + (Number(detail.receivedAmount) || 0),
            0
          );
          this.pinnedBottomRowDataDetails = [
            {
              serviceName: "Total",
              dueAmount: totalDue,
              receivedAmount: totalReceived,
              isTotalRow: true,
            },
          ];
          if (this.detailGridApi) {
            this.detailGridApi.hideOverlay();
            this.detailGridApi.setPinnedBottomRowData(
              this.pinnedBottomRowDataDetails
            );
          }
        } else {
          this.pinnedBottomRowDataDetails = [];
          if (this.detailGridApi) {
            this.detailGridApi.setPinnedBottomRowData([]);
            this.detailGridApi.showNoRowsOverlay();
          }
        }
      },
      error: (error) => {
        this.gridRowDataDetails = [];
        this.pinnedBottomRowDataDetails = [];
        if (this.detailGridApi) {
          this.detailGridApi.setPinnedBottomRowData([]);
          this.detailGridApi.showNoRowsOverlay();
        }
        this.errorHandlingService.errors(error);
      },
    });
  }

  newFeeReceipt() {
    this.openNewReceiptModal();
  }

  openNewReceiptModal() {
    const bsModalRef: BsModalRef = this.modalService.show(
      RentReceiptEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formStatus: "ADD",
          feeReceiptId: 0,
          isRegNoFrozen: false,
          tenant: null,
          allotment: null,
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          const targetReceiptId = result?.receiptId;
          this.getFeeReceipts(targetReceiptId);
        }
        subscription.unsubscribe();
      },
    });
  }

  onPrintReceipt(receipt) {
    if (!receipt || !receipt.id) {
      return;
    }
    this.modalService.show(FeeReceiptPrintModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: true,
      class: "modal-xl modal-dialog-centered",
      initialState: {
        receiptId: receipt.id,
      },
    });
  }

  editFeeReceipt(receipt) {
    if (!receipt || !receipt.id) {
      return;
    }
    const bsModalRef: BsModalRef = this.modalService.show(
      RentReceiptEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          feeReceiptId: receipt.id,
          formStatus: "EDIT",
          isRegNoFrozen: true,
          receipt: {
            receiptNo: receipt.receiptNo || String(receipt.id),
            date: receipt.receiptDate
              ? moment(receipt.receiptDate).toDate()
              : moment().toDate(),
            regNo: receipt.regNo,
            receiptMode: receipt.receiptMode,
            remarks: receipt.remarks,
            selectedTotal: Number(receipt.totalReceivable) || 0,
            totalReceivable: Number(receipt.totalReceivable) || 0,
            receivedAmount: Number(receipt.receivedAmount) || 0,
            balance: Number(receipt.balance) || 0,
          },
          tenant: {
            id: receipt.tenantId,
            name: receipt.tenantName,
            regNo: receipt.regNo,
            mobileNo: receipt.mobileNo,
          },
          allotment: {
            id: receipt.allotmentId,
            propertyId: receipt.propertyId,
            propertyName: receipt.propertyName,
            unitId: receipt.unitId,
            unitNo: receipt.unitNo,
            buildingName: receipt.buildingName,
            serviceName:
              (receipt.details || [])[0]?.serviceName || receipt.serviceName,
          },
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          const targetReceiptId = result?.receiptId || receipt.id;
          this.getFeeReceipts(targetReceiptId);
        }
        subscription.unsubscribe();
      },
    });
  }

  onDeleteReceipt(receipt) {
    if (!receipt || !receipt.id) {
      return;
    }
    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      initialState: {
        title: "Delete Rent Receipt",
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (response: any) => {
        if (response) {
          this.isLoading = true;
          this.selectedReceipt = null;
          this.gridRowDataDetails = [];
          this.pinnedBottomRowDataDetails = [];
          this.receiptGridApi?.deselectAll();
          if (this.detailGridApi) {
            this.detailGridApi.setPinnedBottomRowData([]);
            this.detailGridApi.showNoRowsOverlay();
          }

          this.feeReceiptsService.delete(receipt.id).subscribe({
            next: () => {
              this.toastrMessage.showSuccessMessage("Rent Receipt Deleted");
              this.getFeeReceipts();
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

  exportToCsv() {
    if (this.receiptGridApi) {
      this.receiptGridApi.exportDataAsCsv({
        fileName: `fee_receipts_${moment().format("YYYYMMDD_HHmmss")}.csv`,
      });
    }
  }
}
