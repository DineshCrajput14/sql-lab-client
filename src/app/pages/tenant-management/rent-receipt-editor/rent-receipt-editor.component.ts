import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject, of } from "rxjs";
import { delay } from "rxjs/operators";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { TenantManagementService } from "../tenant-management.service";
import { FeeReceiptsService } from "../../fee-receipts/fee-receipts.service";
import { ErrorHandlingService } from "@app/utils/services/error-handling.service";
import { CancelService } from "@app/utils/services/cancel.service";
import { ConfirmModalComponent } from "src/app/pages/common/confirm-modal/confirm-modal.component";
import { FeeReceiptPrintModalComponent } from "../../fee-receipts/fee-receipt-print-modal/fee-receipt-print-modal.component";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-rent-receipt-editor",
  templateUrl: "./rent-receipt-editor.component.html",
})
export class RentReceiptEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  tenant: any = {};
  allotment: any = {};
  onClose = new Subject<any>();

  isLoading: boolean;
  loadingReceiptData: boolean = false;
  originalReceivedAmount: number = 0;
  dataChanged: boolean = false;

  gridApiDue: GridApi;
  gridApiDetails: GridApi;
  defaultColDef = { resizable: true };
  isRegNoFrozen: boolean = true;
  formStatus: string = "ADD";
  feeReceiptId: number;
  receiptModeLists = [];

  receipt: {
    receiptNo?: string;
    date: Date | string;
    regNo: string;
    receiptMode: number | string;
    remarks: string;
    chequeDraftNo?: string;
    chequeDraftDate?: Date | string;
    selectedTotal: number;
    totalReceivable: number;
    receivedAmount: number;
    balance: number;
  } = {
    receiptNo: "",
    date: moment().toDate(),
    regNo: "",
    receiptMode: undefined,
    remarks: "",
    chequeDraftNo: "",
    chequeDraftDate: moment().toDate(),
    selectedTotal: 0,
    totalReceivable: 0,
    receivedAmount: 0,
    balance: 0,
  };

  get isChequeOrBankTransfer(): boolean {
    const mode = this.receipt.receiptMode;
    const matched = (this.receiptModeLists || []).find(
      (modeItem: any) =>
        modeItem.id === Number(mode) ||
        modeItem.id === mode ||
        modeItem.name === mode
    );
    const modeName = matched ? matched.name : String(mode);
    return (
      modeName === "Cheque" ||
      modeName === "Bank Transfer" ||
      Number(mode) === 2 ||
      Number(mode) === 4
    );
  }
  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  dueRentSummary: {
    id: number;
    dueDate: string;
    amount: number;
    selected: boolean;
  }[] = [];

  receiptDetails: {
    id?: number;
    dueDate: string;
    serviceName: string;
    dueAmount: number;
    receivedAmount: number;
    isAlreadyReceived?: boolean;
  }[] = [];

  columnDefsDue = [
    {
      headerName: "Due Date",
      field: "dueDate",
      flex: 1.5,
      minWidth: 120,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRenderer: (params: any) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Amount",
      field: "amount",
      flex: 1,
      minWidth: 100,
      type: "rightAligned",
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const amount = Number(params.value) || 0;
        return (
          sym +
          amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
    },
  ];

  columnDefsDetails = [
    {
      headerName: "Due Date",
      field: "dueDate",
      flex: 1.2,
      sort: "asc",
      editable: false,
      minWidth: 110,
      cellRenderer: (params: any) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Head",
      field: "serviceName",
      flex: 2,
      editable: false,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Due",
      field: "dueAmount",
      flex: 1,
      minWidth: 105,
      type: "rightAligned",
      cellRenderer: (params: any) => {
        const sym = this.currencySymbol || "";
        const dueAmount = Number(params.value) || 0;
        return (
          sym +
          dueAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
    },
    {
      headerName: "Received",
      field: "receivedAmount",
      flex: 1,
      minWidth: 105,
      type: "rightAligned",
      editable: true,
      cellStyle: {
        backgroundColor: "#f0fdf4",
        border: "1px dashed #22c55e",
        cursor: "pointer",
        "text-align": "right",
      },
      cellRenderer: (params) => {
        const sym = this.currencySymbol || "";
        const receivedAmount = Number(params.value) || 0;
        return (
          sym +
          receivedAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      onCellValueChanged: (params) => {
        this.onDetailReceivedCellValueChanged(params);
      },
    },
  ];

  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private tenantService: TenantManagementService,
    private feeReceiptsService: FeeReceiptsService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.feeReceiptsService.getReceiptModes().subscribe({
      next: (resultGetReceiptModes) =>
        this.getReceiptModes(resultGetReceiptModes),
      error: (error) => this.errorHandlingService.errors(error),
    });

    this.isRegNoFrozen =
      !!(this.tenant && this.tenant.id) || this.formStatus === "EDIT";
    if (this.tenant?.regNo && !this.receipt.regNo) {
      this.receipt.regNo = this.tenant.regNo;
    }
    if (this.formStatus === "EDIT" && this.feeReceiptId > 0) {
      if (!this.receipt.receiptNo) {
        this.receipt.receiptNo = String(this.feeReceiptId);
      }
      this.getFeeReceiptDetails(this.feeReceiptId);
    } else {
      this.initData();
    }
  }

  getReceiptModes(resultGetReceiptModes) {
    this.receiptModeLists = [];
    if (
      resultGetReceiptModes &&
      (resultGetReceiptModes.receiptModes || []).length
    ) {
      this.receiptModeLists = resultGetReceiptModes.receiptModes;
      if (this.receiptModeLists.length > 0 && !this.receipt.receiptMode) {
        this.receipt.receiptMode = this.receiptModeLists[0].id;
      }
    }
  }

  getFeeReceiptDetails(receiptId: number) {
    this.loadingReceiptData = true;
    this.isLoading = true;
    this.feeReceiptsService
      .getFeeReceipt(receiptId)
      .pipe(delay(300))
      .subscribe({
        next: (resultGetFeeReceiptDetails) => {
          this.getFeeReceiptDetailsResults(resultGetFeeReceiptDetails);
          this.isLoading = false;
          this.loadingReceiptData = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.loadingReceiptData = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  getFeeReceiptDetailsResults(resultGetFeeReceiptDetails) {
    const feeReceipt = resultGetFeeReceiptDetails?.rentReceipt;
    if (feeReceipt) {
      this.receipt.receiptNo = feeReceipt.receiptNo || "";
      this.receipt.date = feeReceipt.receiptDate
        ? moment(feeReceipt.receiptDate).toDate()
        : moment().toDate();
      this.receipt.regNo = feeReceipt.regNo || "";
      const matchedMode = (this.receiptModeLists || []).find(
        (modeItem: any) =>
          modeItem.id === feeReceipt.receiptModeId ||
          modeItem.name === feeReceipt.receiptMode
      );
      this.receipt.receiptMode = matchedMode
        ? matchedMode.id
        : feeReceipt.receiptModeId;
      this.receipt.remarks = feeReceipt.remarks || "";
      this.receipt.chequeDraftNo = feeReceipt.chequeDraftNo || "";
      this.receipt.chequeDraftDate = feeReceipt.chequeDraftDate
        ? moment(feeReceipt.chequeDraftDate).toDate()
        : moment().toDate();
      this.receipt.totalReceivable = Number(feeReceipt.totalReceivable) || 0;
      this.originalReceivedAmount = Number(feeReceipt.receivedAmount) || 0;
      this.receipt.receivedAmount = this.originalReceivedAmount;
      this.receipt.balance = Number(
        (this.receipt.totalReceivable - this.receipt.receivedAmount).toFixed(2)
      );
      this.receipt.selectedTotal = this.receipt.totalReceivable;

      this.tenant = {
        id: feeReceipt.tenantId,
        name: feeReceipt.tenantName,
        regNo: feeReceipt.regNo,
        mobileNo: feeReceipt.mobileNo,
      };

      this.allotment = {
        id: feeReceipt.allotmentId,
        propertyId: feeReceipt.propertyId,
        propertyName: feeReceipt.propertyName,
        unitId: feeReceipt.unitId,
        unitNo: feeReceipt.unitNo,
        buildingName: feeReceipt.buildingName,
        serviceName: feeReceipt.serviceName,
      };

      this.receiptDetails = (feeReceipt.details || []).map(
        (detailItem: any) => {
          return {
            id: detailItem.id,
            dueDate: detailItem.dueDate,
            serviceName: detailItem.serviceName,
            dueAmount: Number(detailItem.dueAmount) || 0,
            receivedAmount: Number(detailItem.receivedAmount) || 0,
          };
        }
      );

      const dueMap = new Map<string, number>();
      this.receiptDetails.forEach((detailItem) => {
        const curr = dueMap.get(detailItem.dueDate) || 0;
        dueMap.set(detailItem.dueDate, curr + Number(detailItem.dueAmount));
      });

      this.dueRentSummary = Array.from(dueMap.entries()).map(
        ([dueDate, amount], idx) => ({
          id: idx + 1,
          dueDate,
          amount,
          selected: true,
        })
      );

      if (this.gridApiDue) {
        this.gridApiDue.setRowData(this.dueRentSummary);
        this.gridApiDue.forEachNode((node) => {
          if (node && node.data && node.data.selected) {
            node.setSelected(true);
          }
        });
      }
      if (this.gridApiDetails) {
        this.gridApiDetails.setRowData(this.receiptDetails);
      }

      this.loadingReceiptData = false;
    }
  }

  initData() {
    if (this.tenant?.regNo) {
      this.receipt.regNo = this.tenant.regNo;
    }
    if (this.receipt.regNo) {
      this.onSearchByRegNo();
    } else {
      this.clear();
      this.isLoading = false;
    }
  }

  onDueGridReady(params) {
    this.gridApiDue = params.api;
  }

  onDetailsGridReady(params) {
    this.gridApiDetails = params.api;
  }

  onDueFirstDataRendered(params) {
    if (params.api) {
      params.api.sizeColumnsToFit();
      if (this.formStatus === "EDIT") {
        params.api.forEachNode((node) => {
          if (node && node.data && node.data.selected) {
            node.setSelected(true);
          }
        });
        this.loadingReceiptData = false;
      } else {
        if (this.dueRentSummary && this.dueRentSummary.length > 0) {
          params.api.forEachNode((node, index) => {
            if (index === 0) {
              node.setSelected(true);
            }
          });
        }
      }
    }
  }

  onDetailsFirstDataRendered(params) {
    if (params.api) {
      params.api.sizeColumnsToFit();
    }
  }

  onDueSelectionChanged() {
    if (this.formStatus === "EDIT" || this.loadingReceiptData) {
      return;
    }

    let sum = 0;
    this.receiptDetails = [];

    const baseRent = Number(this.allotment?.charges) || 0;
    const selectedRows = this.gridApiDue
      ? this.gridApiDue.getSelectedRows()
      : this.dueRentSummary.filter((dueItem) => dueItem.selected);

    if (this.gridApiDue) {
      const selectedSet = new Set(
        selectedRows.map((row: any) => row.id || row.dueDate)
      );
      this.dueRentSummary.forEach((dueItem) => {
        dueItem.selected = selectedSet.has(dueItem.id || dueItem.dueDate);
      });
    }

    selectedRows.forEach((dueItem) => {
      const dueAmountForThisRow = Number(dueItem.amount) || 0;
      sum += dueAmountForThisRow;

      if (
        dueItem.heads &&
        Array.isArray(dueItem.heads) &&
        dueItem.heads.length > 0
      ) {
        dueItem.heads.forEach((headItem: any) => {
          this.receiptDetails.push({
            dueDate: headItem.dueDate || dueItem.dueDate,
            serviceName: headItem.serviceName,
            dueAmount: Number(headItem.dueAmount) || 0,
            receivedAmount:
              Number(headItem.receivedAmount ?? headItem.dueAmount) || 0,
          });
        });
      } else {
        const rentName = this.allotment?.serviceName;
        const chargeHeads: { serviceName: string; amount: number }[] = [];
        if (baseRent > 0) {
          chargeHeads.push({
            serviceName: rentName,
            amount: baseRent,
          });
        }

        const isFirstMonth =
          dueItem.monthIndex !== undefined
            ? dueItem.monthIndex === 0
            : this.dueRentSummary.length > 0 &&
              dueItem.dueDate === this.dueRentSummary[0].dueDate;

        const securityAmount = Number(this.allotment?.securityAmount) || 0;
        if (securityAmount > 0 && isFirstMonth) {
          chargeHeads.push({
            serviceName: "Security",
            amount: securityAmount,
          });
        }

        const additionalCharges = (
          this.allotment?.additionalCharges || []
        ).filter((chargeItem: any) => {
          if (chargeItem.isTotalRow) return false;
          const amount = Number(chargeItem.chargeAmount) || 0;
          if (amount <= 0) return false;
          if (chargeItem.type === "One Time") {
            return isFirstMonth;
          }
          return true;
        });

        additionalCharges.forEach((chargeItem: any) => {
          chargeHeads.push({
            serviceName: chargeItem.serviceName,
            amount: Number(chargeItem.chargeAmount) || 0,
          });
        });

        if (chargeHeads.length === 1) {
          const headItem = chargeHeads[0];
          this.receiptDetails.push({
            dueDate: dueItem.dueDate,
            serviceName: headItem.serviceName,
            dueAmount: dueAmountForThisRow,
            receivedAmount: dueAmountForThisRow,
          });
        } else if (chargeHeads.length > 1) {
          const totalBase = chargeHeads.reduce(
            (total, headItem) => total + headItem.amount,
            0
          );
          let allocatedAmount = 0;
          chargeHeads.forEach((headItem, headIndex) => {
            const ratio =
              totalBase > 0
                ? headItem.amount / totalBase
                : 1 / chargeHeads.length;
            const headDue =
              headIndex === chargeHeads.length - 1
                ? Number((dueAmountForThisRow - allocatedAmount).toFixed(2))
                : Number((dueAmountForThisRow * ratio).toFixed(2));
            allocatedAmount += headDue;
            this.receiptDetails.push({
              dueDate: dueItem.dueDate,
              serviceName: headItem.serviceName,
              dueAmount: headDue,
              receivedAmount: headDue,
            });
          });
        } else {
          this.receiptDetails.push({
            dueDate: dueItem.dueDate,
            serviceName: rentName,
            dueAmount: dueAmountForThisRow,
            receivedAmount: dueAmountForThisRow,
          });
        }
      }
    });

    this.receipt.selectedTotal = sum;
    this.receipt.totalReceivable = sum;

    if (this.formStatus === "EDIT") {
      this.receipt.balance = Number(
        (
          this.receipt.totalReceivable - Number(this.receipt.receivedAmount)
        ).toFixed(2)
      );
      this.updateGridReceivedFromTotal();
    } else {
      this.receipt.receivedAmount = sum;
      this.receipt.balance = 0;
      this.updateGridReceivedFromTotal();
    }
  }

  onReceivedAmountChange() {
    const totalReceivable = Number(this.receipt.totalReceivable) || 0;
    const received = Number(this.receipt.receivedAmount) || 0;
    this.receipt.balance = Number((totalReceivable - received).toFixed(2));

    if (received > totalReceivable) {
      this.toastrMessage.showWarning(
        "Receiving amount cannot be greater than the selected Rent amount."
      );
    }
    this.updateGridReceivedFromTotal();
  }

  updateGridReceivedFromTotal() {
    let remaining = Number(this.receipt.receivedAmount) || 0;
    if (remaining < 0) {
      remaining = 0;
    }
    this.receiptDetails.forEach((item) => {
      const due = Number(item.dueAmount) || 0;
      if (remaining <= 0) {
        item.receivedAmount = 0;
      } else if (remaining <= due) {
        item.receivedAmount = Number(remaining.toFixed(2));
        remaining = 0;
      } else {
        item.receivedAmount = due;
        remaining = Number((remaining - due).toFixed(2));
      }
    });
    if (this.gridApiDetails) {
      this.gridApiDetails.setRowData(this.receiptDetails);
    }
  }

  onDetailReceivedCellValueChanged(params: any) {
    const enteredAmount = Number(params.newValue);
    if (
      isNaN(enteredAmount) ||
      params.newValue === "" ||
      params.newValue === null
    ) {
      params.data.receivedAmount = params.oldValue;
      this.toastrMessage.showWarning("Amount must be a number");
      this.gridApiDetails?.refreshCells();
      return;
    }
    if (enteredAmount < 0) {
      params.data.receivedAmount = params.oldValue;
      this.toastrMessage.showWarning("Amount should not be less than 0");
      this.gridApiDetails?.refreshCells();
      return;
    }
    if (enteredAmount > Number(params.data.dueAmount)) {
      params.data.receivedAmount = params.oldValue;
      this.toastrMessage.showWarning(
        "Amount should not be greater than " + params.data.dueAmount
      );
      this.gridApiDetails?.refreshCells();
      return;
    }
    params.data.receivedAmount = enteredAmount;
    const totalGridReceived = this.receiptDetails.reduce(
      (sum, item) => sum + (Number(item.receivedAmount) || 0),
      0
    );
    this.receipt.receivedAmount = Number(totalGridReceived.toFixed(2));
    this.receipt.balance = Number(
      (this.receipt.totalReceivable - this.receipt.receivedAmount).toFixed(2)
    );
    this.gridApiDetails?.refreshCells();
  }

  onSearchByRegNo() {
    if (!this.receipt.regNo) {
      this.toastrMessage.showWarning("Please enter a registration number");
      return;
    }
    const searchedRegNo = String(this.receipt.regNo).trim();
    this.isLoading = true;

    const params = {
      registrationNumber: searchedRegNo,
      receiptDate: moment(this.receipt.date).format("YYYY-MM-DD"),
    };

    this.tenantService
      .getTenantRentDueDates(this.feeReceiptId || 0, params)
      .pipe(delay(300))
      .subscribe({
        next: (resultGetTenantRentDueDates) => {
          this.isLoading = false;
          if (
            resultGetTenantRentDueDates &&
            resultGetTenantRentDueDates.tenantDetail
          ) {
            this.tenant = resultGetTenantRentDueDates.tenantDetail;
            this.receipt.regNo = this.tenant.regNo;
            this.allotment =
              resultGetTenantRentDueDates.tenantDetail.allotment || {};

            const dueList = resultGetTenantRentDueDates.dueRentSummary || [];
            if (dueList.length === 0) {
              this.dueRentSummary = [];
              this.receiptDetails = [];
              this.receipt.selectedTotal = 0;
              this.receipt.totalReceivable = 0;
              this.receipt.receivedAmount = 0;
              this.receipt.balance = 0;
              if (this.gridApiDue) {
                this.gridApiDue.setRowData([]);
              }
              if (this.gridApiDetails) {
                this.gridApiDetails.setRowData([]);
              }
              this.toastrMessage.showWarning(
                "The Rent already taken against all due dates."
              );
            } else {
              this.dueRentSummary = dueList.map(
                (dueItem: any, dueIndex: number) => ({
                  ...dueItem,
                  selected: dueIndex === 0,
                })
              );
              this.receiptDetails =
                resultGetTenantRentDueDates.receiptDetails || [];
              if (this.gridApiDue) {
                this.gridApiDue.setRowData(this.dueRentSummary);
                of(1)
                  .pipe(delay(50))
                  .subscribe({
                    next: () => {
                      if (this.gridApiDue) {
                        this.gridApiDue.forEachNode((node, index) => {
                          if (index === 0) {
                            node.setSelected(true);
                          }
                        });
                      }
                    },
                  });
              }
              this.onDueSelectionChanged();
            }
          } else {
            this.toastrMessage.showWarning(
              'No record found for "' + searchedRegNo + '"'
            );
            this.clear();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  clear() {
    this.tenant = null;
    this.allotment = null;
    this.dueRentSummary = [];
    this.receiptDetails = [];
    this.receipt.selectedTotal = 0;
    this.receipt.totalReceivable = 0;
    this.receipt.receivedAmount = 0;
    this.receipt.balance = 0;
    this.receipt.chequeDraftNo = "";
    this.receipt.chequeDraftDate = moment().toDate();
    if (this.gridApiDue) {
      this.gridApiDue.setRowData([]);
    }
    if (this.gridApiDetails) {
      this.gridApiDetails.setRowData([]);
    }
  }

  onClearRegNo() {
    this.receipt.regNo = "";
    this.clear();
  }

  checkValidations(): boolean {
    if (Number(this.receipt.receivedAmount) < 1) {
      this.toastrMessage.showWarning("Received Amount must be at least 1.");
      return false;
    }
    const hasSelectedDue = this.gridApiDue
      ? (this.gridApiDue.getSelectedRows() || []).length > 0
      : (this.dueRentSummary || []).some((dueItem) => dueItem.selected);
    if (!hasSelectedDue) {
      this.toastrMessage.showWarning("Select at least one due date");
      return false;
    }
    if (
      Number(this.receipt.receivedAmount) > Number(this.receipt.totalReceivable)
    ) {
      this.toastrMessage.showWarning(
        "Receiving amount cannot be greater than the selected Rent amount."
      );
      return false;
    }
    if (this.isChequeOrBankTransfer) {
      if (
        !this.receipt.chequeDraftNo ||
        !String(this.receipt.chequeDraftNo).trim()
      ) {
        this.toastrMessage.showWarning(
          "Please enter a valid cheque/draft number."
        );
        return false;
      }
      if (!this.receipt.chequeDraftDate) {
        this.toastrMessage.showWarning(
          "Please enter a valid cheque/draft date."
        );
        return false;
      }
    }
    return true;
  }

  checkAmountChange() {
    if (!this.checkValidations()) {
      return;
    }
    if (
      this.formStatus === "EDIT" &&
      this.originalReceivedAmount > 0 &&
      Number(this.receipt.receivedAmount) !==
        Number(this.originalReceivedAmount)
    ) {
      const bsModalRef = this.modalService.show(ConfirmModalComponent, {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-md",
        initialState: {
          message:
            "Receipt amount has changed from " +
            this.originalReceivedAmount +
            " to " +
            this.receipt.receivedAmount +
            ". Are you sure to save?",
        },
      });
      const subscription = bsModalRef.content.onClose.subscribe({
        next: (resultConfirm: boolean) => {
          if (resultConfirm) {
            this.save();
          }
          subscription.unsubscribe();
        },
      });
    } else {
      this.save();
    }
  }

  save() {
    if (!this.checkValidations()) {
      return;
    }

    this.isLoading = true;
    this.dataChanged = true;

    const payload: any = {
      receiptDate: this.receipt.date
        ? moment(this.receipt.date).format("YYYY-MM-DD")
        : "",
      tenantId: this.tenant?.id,
      allotmentId: this.allotment?.id,
      propertyId: this.allotment?.propertyId,
      unitId: this.allotment?.unitId,
      receiptMode: this.receipt.receiptMode,
      totalReceivable: this.receipt.totalReceivable,
      receivedAmount: Number(this.receipt.receivedAmount) || 0,
      balance: this.receipt.balance,
      remarks: this.receipt.remarks,
      chequeDraftNo: this.isChequeOrBankTransfer
        ? this.receipt.chequeDraftNo
        : null,
      chequeDraftDate: this.isChequeOrBankTransfer
        ? this.receipt.chequeDraftDate
          ? moment(this.receipt.chequeDraftDate).format("YYYY-MM-DD")
          : null
        : null,
      details: this.receiptDetails,
    };

    if (this.formStatus === "EDIT") {
      this.feeReceiptsService
        .update(this.feeReceiptId, payload)
        .pipe(delay(300))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.toastrMessage.showSuccessMessage("Rent Receipt Updated");
            this.confirmPrint(this.feeReceiptId, response?.rentReceipt);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorHandlingService.errors(error);
          },
        });
    } else {
      this.feeReceiptsService
        .create(payload)
        .pipe(delay(300))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.toastrMessage.showSuccessMessage("Rent Receipt Created");
            const newReceiptId = response?.id;
            this.confirmPrint(newReceiptId, response?.rentReceipt);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  confirmPrint(receiptId: number, savedReceipt?: any) {
    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: "Do you want to print Rent receipt?",
      },
    });

    const subscription = confirmModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        confirmModalRef.hide();
        this.bsModalRef.hide();
        this.onClose.next({
          dataChanged: true,
          receipt: savedReceipt,
          receiptId: receiptId,
        });
        if (resultConfirm && receiptId) {
          this.modalService.show(FeeReceiptPrintModalComponent, {
            animated: true,
            backdrop: "static",
            keyboard: true,
            class: "modal-xl modal-dialog-centered",
            initialState: {
              receiptId: receiptId,
              receiptData: savedReceipt,
            },
          });
        }
        subscription.unsubscribe();
      },
    });
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form.dirty) {
      this.cancelService.cancel(this.bsModalRef);
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeyEscape() {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
  }
}
