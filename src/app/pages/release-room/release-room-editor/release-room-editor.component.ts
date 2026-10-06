import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { of, Subject } from "rxjs";
import { delay } from "rxjs/operators";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ReleaseRoomService } from "../release-room.service";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-release-room-editor",
  templateUrl: "./release-room-editor.component.html",
})
export class ReleaseRoomEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  tenant: any = {};
  allotment: any = {};
  onClose = new Subject<any>();

  isLoading: boolean;
  dataChanged: boolean = false;
  formStatus: string = "ADD";
  releaseRoomId: number;
  isRegNoFrozen: boolean = false;

  release: {
    date: Date | string;
    regNo: string;
    receiptNo: string;
    receiptMode: number | string;
    chequeDraftNo: string;
    chequeDraftDate: Date | string;
    remarks: string;
    selectedTotal: number;
    totalRefundable: number;
    refundAmount: number;
    balance: number;
    isReleaseDate: boolean;
    releaseDate: Date | string;
    deleteDues: boolean;
    deleteDuesFromDate: Date | string;
  } = {
    date: moment().toDate(),
    regNo: "",
    receiptNo: "",
    receiptMode: undefined,
    chequeDraftNo: "",
    chequeDraftDate: moment().toDate(),
    remarks: "",
    selectedTotal: 0,
    totalRefundable: 0,
    refundAmount: 0,
    balance: 0,
    isReleaseDate: false,
    releaseDate: null,
    deleteDues: false,
    deleteDuesFromDate: null,
  };

  receiptModeLists = [];
  receiptsSummary = [];
  refundDetails = [];

  gridApiSummary: GridApi;
  gridApiDetails: GridApi;
  defaultColDef = { resizable: true };

  get isChequeOrBankTransfer(): boolean {
    const mode = this.release.receiptMode;
    const matched = (this.receiptModeLists || []).find(
      (item: any) =>
        item.id === Number(mode) || item.id === mode || item.name === mode
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
  columnDefsReceiptsSummary = [
    {
      headerName: "Due Date",
      field: "dueDate",
      flex: 1.3,
      minWidth: 110,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRenderer: (params) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Receipt No.",
      field: "receiptNo",
      flex: 1.1,
      minWidth: 95,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Amount",
      field: "amount",
      flex: 1,
      minWidth: 90,
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
    },
  ];

  columnDefsRefundDetails = [
    {
      headerName: "Due Date",
      field: "dueDate",
      flex: 1.1,
      minWidth: 105,
      cellRenderer: (params) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Receipt No.",
      field: "receiptNo",
      flex: 1,
      minWidth: 95,
    },
    {
      headerName: "Head",
      field: "serviceName",
      flex: 1.3,
      minWidth: 110,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Refundable",
      field: "receivedAmount",
      flex: 1,
      minWidth: 90,
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
    },
    {
      headerName: "Refund",
      field: "refundAmount",
      flex: 1,
      minWidth: 95,
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
        const refundVal = Number(params.value) || 0;
        return (
          sym +
          refundVal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      onCellValueChanged: (params) => {
        this.onDetailRefundCellValueChanged(params);
      },
    },
  ];

  constructor(
    public bsModalRef: BsModalRef,
    private releaseRoomService: ReleaseRoomService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.releaseRoomService.getReceiptModes().subscribe({
      next: (resultGetReceiptModes) =>
        this.getReceiptModes(resultGetReceiptModes),
      error: (error) => this.errorHandlingService.errors(error),
    });

    this.isRegNoFrozen =
      !!(this.tenant && this.tenant.id) || this.formStatus === "EDIT";

    if (this.tenant?.regNo && !this.release.regNo) {
      this.release.regNo = this.tenant.regNo;
    }

    if (this.formStatus === "EDIT" && this.releaseRoomId > 0) {
      this.loadRecordForEdit(this.releaseRoomId);
    } else if (this.release.regNo) {
      this.onSearchByRegNo();
    }
  }

  getReceiptModes(resultGetReceiptModes) {
    this.receiptModeLists = [];
    if (
      resultGetReceiptModes &&
      (resultGetReceiptModes.receiptModes || []).length
    ) {
      this.receiptModeLists = resultGetReceiptModes.receiptModes;
      if (this.receiptModeLists.length > 0 && !this.release.receiptMode) {
        this.release.receiptMode = this.receiptModeLists[0].id;
      }
    }
  }

  onReleaseDateToggle() {
    if (this.release.isReleaseDate) {
      if (!this.release.releaseDate) {
        this.release.releaseDate = moment().toDate();
      }
    } else {
      this.release.releaseDate = null;
    }
  }

  onDeleteDuesToggle() {
    if (this.release.deleteDues) {
      if (!this.release.deleteDuesFromDate) {
        this.release.deleteDuesFromDate = moment().toDate();
      }
    } else {
      this.release.deleteDuesFromDate = null;
    }
  }

  loadRecordForEdit(id: number) {
    this.isLoading = true;
    this.releaseRoomService
      .getReleaseRoom(id)
      .pipe(delay(300))
      .subscribe({
        next: (resultGetReleaseRoom: any) => {
          this.isLoading = false;
          const releaseRoomRecord = resultGetReleaseRoom?.releaseRoom;
          if (releaseRoomRecord) {
            this.release.date = releaseRoomRecord.date
              ? moment(releaseRoomRecord.date).toDate()
              : moment().toDate();
            this.release.regNo = releaseRoomRecord.regNo;
            this.release.receiptNo = releaseRoomRecord.receiptNo;
            this.release.isReleaseDate = Boolean(
              releaseRoomRecord.isReleaseDate || releaseRoomRecord.releaseDate
            );
            this.release.releaseDate = releaseRoomRecord.releaseDate
              ? moment(releaseRoomRecord.releaseDate).toDate()
              : null;
            this.release.deleteDues = Boolean(releaseRoomRecord.deleteDues);
            this.release.deleteDuesFromDate = releaseRoomRecord.deleteDuesFromDate
              ? moment(releaseRoomRecord.deleteDuesFromDate).toDate()
              : null;

            this.release.receiptMode = releaseRoomRecord.receiptModeId;
            this.release.remarks = releaseRoomRecord.remarks || "";
            this.release.chequeDraftNo = releaseRoomRecord.chequeDraftNo || "";
            this.release.chequeDraftDate = releaseRoomRecord.chequeDraftDate
              ? moment(releaseRoomRecord.chequeDraftDate).toDate()
              : moment().toDate();

            this.tenant = {
              name: releaseRoomRecord.tenantName,
              mobileNo: releaseRoomRecord.mobileNo,
              regNo: releaseRoomRecord.regNo,
            };

            this.allotment = {
              id: releaseRoomRecord.allotmentId,
              propertyId: releaseRoomRecord.propertyId,
              propertyName: releaseRoomRecord.propertyName,
              buildingId: releaseRoomRecord.buildingId,
              buildingName: releaseRoomRecord.buildingName,
              unitId: releaseRoomRecord.unitId,
              unitNo: releaseRoomRecord.unitNo,
              floorName: releaseRoomRecord.floorName,
            };

            this.receiptsSummary = [
              {
                id: releaseRoomRecord.id,
                dueDate: releaseRoomRecord.date,
                receiptNo: releaseRoomRecord.receiptNo,
                amount: Number(releaseRoomRecord.totalAmount) || 0,
                selected: true,
                details: releaseRoomRecord.details || [],
              },
            ];

            this.refundDetails = (releaseRoomRecord.details || []).map(
              (detailItem) => ({
                id: detailItem.id,
                receiptNo: releaseRoomRecord.receiptNo,
                dueDate: detailItem.dueDate,
                serviceName: detailItem.serviceName,
                dueAmount: Number(detailItem.dueAmount) || 0,
                receivedAmount: Number(detailItem.receivedAmount) || 0,
                refundAmount: Number(detailItem.refundAmount) || 0,
              })
            );

            const totalAmount = Number(releaseRoomRecord.totalAmount) || 0;
            this.release.selectedTotal = totalAmount;
            this.release.totalRefundable = totalAmount;
            this.release.refundAmount =
              Number(releaseRoomRecord.refundAmount) || 0;
            this.release.balance = Number(releaseRoomRecord.balance) || 0;

            if (this.gridApiSummary) {
              this.gridApiSummary.setRowData(this.receiptsSummary);
            }
            if (this.gridApiDetails) {
              this.gridApiDetails.setRowData(this.refundDetails);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  onSearchByRegNo() {
    if (!this.release.regNo || !this.release.regNo.trim()) {
      this.toastrMessage.showWarning("Please enter a registration number");
      return;
    }

    const searchedRegNo = this.release.regNo.trim();
    this.isLoading = true;
    const params = {
      registrationNumber: searchedRegNo,
      receiptDate: this.release.date
        ? moment(this.release.date).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
    };

    this.releaseRoomService
      .getTenantDetail(params)
      .pipe(delay(300))
      .subscribe({
        next: (resultGetTenantDetail: any) => {
          this.isLoading = false;
          const tenantData = resultGetTenantDetail?.tenantDetail;
          if (!tenantData) {
            this.toastrMessage.showWarning(
              `No record found for "${searchedRegNo}"`
            );
            this.onClearRegNo();
            return;
          }

          this.tenant = tenantData;
          this.release.regNo = tenantData.regNo;
          this.allotment = tenantData.allotment || {};
          const dueList = resultGetTenantDetail?.dueRentSummary || [];
          const receiptDetails = resultGetTenantDetail?.receiptDetails || [];

          if (dueList.length === 0) {
            this.receiptsSummary = [];
            this.refundDetails = [];
            this.release.selectedTotal = 0;
            this.release.totalRefundable = 0;
            this.release.refundAmount = 0;
            this.release.balance = 0;
            if (this.gridApiSummary) {
              this.gridApiSummary.setRowData([]);
            }
            if (this.gridApiDetails) {
              this.gridApiDetails.setRowData([]);
            }
            this.toastrMessage.showWarning(
              "No paid Rent receipts found for this tenant to refund."
            );
            return;
          }

          this.receiptsSummary = dueList.map((dueRow) => {
            const matchingDetails = receiptDetails.filter(
              (detail) => detail.dueDate === dueRow.dueDate
            );
            const detailsList =
              matchingDetails.length > 0
                ? matchingDetails.map((detail) => ({
                    id: detail.id,
                    receiptNo: detail.receiptNo || dueRow.receiptNo,
                    dueDate: detail.dueDate,
                    serviceName: detail.serviceName,
                    dueAmount: Number(detail.dueAmount) || 0,
                    receivedAmount: Number(detail.receivedAmount) || 0,
                    refundAmount: 0,
                  }))
                : [
                    {
                      id: dueRow.id,
                      receiptNo: dueRow.receiptNo,
                      dueDate: dueRow.dueDate,
                      serviceName: dueRow.serviceName,
                      dueAmount: Number(dueRow.amount) || 0,
                      receivedAmount: Number(dueRow.amount) || 0,
                      refundAmount: 0,
                    },
                  ];

            return {
              id: dueRow.id,
              dueDate: dueRow.dueDate,
              receiptNo: dueRow.receiptNo,
              amount: Number(dueRow.amount) || 0,
              selected: true,
              details: detailsList,
            };
          });

          if (this.gridApiSummary) {
            this.gridApiSummary.setRowData(this.receiptsSummary);
          }

          of(1)
            .pipe(delay(50))
            .subscribe({
              next: () => {
                if (this.gridApiSummary && this.receiptsSummary.length > 0) {
                  this.gridApiSummary.forEachNode((node) => {
                    node.setSelected(true);
                  });
                }
              },
            });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
      });
  }

  onClearRegNo() {
    this.release.regNo = "";
    this.tenant = null;
    this.allotment = null;
    this.receiptsSummary = [];
    this.refundDetails = [];
    this.release.selectedTotal = 0;
    this.release.totalRefundable = 0;
    this.release.refundAmount = 0;
    this.release.balance = 0;
    this.release.isReleaseDate = false;
    this.release.releaseDate = null;
    this.release.deleteDues = false;
    this.release.deleteDuesFromDate = null;

    if (this.gridApiSummary) {
      this.gridApiSummary.setRowData([]);
    }
    if (this.gridApiDetails) {
      this.gridApiDetails.setRowData([]);
    }
  }

  onReceiptsSummaryGridReady(params) {
    this.gridApiSummary = params.api;
    if (this.receiptsSummary && this.receiptsSummary.length > 0) {
      this.gridApiSummary.setRowData(this.receiptsSummary);
    }
  }

  onReceiptsSummaryFirstDataRendered(params) {
    if (params.api) {
      params.api.sizeColumnsToFit();
      if (this.formStatus === "EDIT") {
        params.api.forEachNode((node) => {
          if (node && node.data && node.data.selected) {
            node.setSelected(true);
          }
        });
      } else {
        if (this.receiptsSummary && this.receiptsSummary.length > 0) {
          params.api.forEachNode((node, index) => {
            if (index === 0) {
              node.setSelected(true);
            }
          });
        }
      }
    }
  }

  onRefundDetailsGridReady(params) {
    this.gridApiDetails = params.api;
    if (this.refundDetails && this.refundDetails.length > 0) {
      this.gridApiDetails.setRowData(this.refundDetails);
    }
  }

  onRefundDetailsFirstDataRendered(params) {
    if (params.api) {
      params.api.sizeColumnsToFit();
    }
  }

  onReceiptsSummarySelectionChanged() {
    const selectedNodes = this.gridApiSummary?.getSelectedNodes() || [];
    this.refundDetails = [];
    let selectedSum = 0;

    selectedNodes.forEach((node) => {
      selectedSum += Number(node.data?.amount) || 0;
      const detailsList = node.data?.details || [];
      if (detailsList.length) {
        detailsList.forEach((detail) => {
          this.refundDetails.push({
            id: detail.id,
            receiptNo: detail.receiptNo || node.data?.receiptNo,
            dueDate: detail.dueDate,
            serviceName: detail.serviceName,
            dueAmount: Number(detail.dueAmount) || 0,
            receivedAmount: Number(detail.receivedAmount) || 0,
            refundAmount: Number(detail.refundAmount) || 0,
          });
        });
      }
    });

    this.release.selectedTotal = Number(selectedSum.toFixed(2));
    this.release.totalRefundable = Number(selectedSum.toFixed(2));

    const totalRefund = this.refundDetails.reduce(
      (sum, item) => sum + (Number(item.refundAmount) || 0),
      0
    );
    this.release.refundAmount = Number(totalRefund.toFixed(2));
    this.release.balance = Number(
      (this.release.totalRefundable - this.release.refundAmount).toFixed(2)
    );

    if (this.gridApiDetails) {
      this.gridApiDetails.setRowData(this.refundDetails);
    }
  }

  onDetailRefundCellValueChanged(params) {
    const enteredAmount = Number(params.newValue);
    if (
      isNaN(enteredAmount) ||
      params.newValue === "" ||
      params.newValue === null
    ) {
      params.data.refundAmount = params.oldValue;
      this.toastrMessage.showWarning("Amount must be a number");
      this.gridApiDetails?.refreshCells();
      return;
    }

    if (enteredAmount < 0) {
      params.data.refundAmount = params.oldValue;
      this.toastrMessage.showWarning("Amount should not be less than 0");
      this.gridApiDetails?.refreshCells();
      return;
    }

    const maxAllowed = Number(params.data.receivedAmount);
    if (enteredAmount > maxAllowed) {
      params.data.refundAmount = params.oldValue;
      this.toastrMessage.showWarning(
        "Refund amount should not be greater than refundable amount of " +
          maxAllowed.toFixed(2)
      );
      this.gridApiDetails?.refreshCells();
      return;
    }

    params.data.refundAmount = enteredAmount;

    this.receiptsSummary.forEach((dueSummaryRow) => {
      const summaryDetails = dueSummaryRow.details || [];
      const matchedChargeDetail = summaryDetails.find(
        (detailItem: any) =>
          detailItem.dueDate === params.data.dueDate &&
          detailItem.serviceName === params.data.serviceName
      );
      if (matchedChargeDetail) {
        matchedChargeDetail.refundAmount = enteredAmount;
      }
    });

    const totalGridRefund = this.refundDetails.reduce(
      (sum, refundRow) => sum + (Number(refundRow.refundAmount) || 0),
      0
    );

    this.release.refundAmount = Number(totalGridRefund.toFixed(2));
    this.release.balance = Number(
      (this.release.totalRefundable - this.release.refundAmount).toFixed(2)
    );
    this.gridApiDetails?.refreshCells();
  }

  onRefundAmountInputChange() {
    let remaining = Number(this.release.refundAmount) || 0;
    const total = Number(this.release.totalRefundable) || 0;
    this.release.balance = Number((total - remaining).toFixed(2));

    if (remaining > total) {
      this.toastrMessage.showWarning(
        "Refund amount cannot be greater than the selected Rent amount."
      );
    }

    if (remaining < 0) remaining = 0;
    this.refundDetails.forEach((refundDetailRow) => {
      const received = Number(refundDetailRow.receivedAmount) || 0;
      if (remaining <= 0) {
        refundDetailRow.refundAmount = 0;
      } else if (remaining <= received) {
        refundDetailRow.refundAmount = Number(remaining.toFixed(2));
        remaining = 0;
      } else {
        refundDetailRow.refundAmount = received;
        remaining = Number((remaining - received).toFixed(2));
      }

      this.receiptsSummary.forEach((dueSummaryRow) => {
        const summaryDetails = dueSummaryRow.details || [];
        const matchedChargeDetail = summaryDetails.find(
          (detailItem: any) =>
            detailItem.dueDate === refundDetailRow.dueDate &&
            detailItem.serviceName === refundDetailRow.serviceName
        );
        if (matchedChargeDetail) {
          matchedChargeDetail.refundAmount = refundDetailRow.refundAmount;
        }
      });
    });

    if (this.gridApiDetails) {
      this.gridApiDetails.setRowData(this.refundDetails);
    }
  }

  onSubmit() {
    this.gridApiDetails?.stopEditing();
    this.gridApiSummary?.stopEditing();

    if (!this.tenant || !this.tenant.id) {
      this.toastrMessage.showWarning("Please search and select a tenant first");
      return;
    }

    if (this.release.refundAmount > this.release.totalRefundable) {
      this.toastrMessage.showWarning(
        "Refund amount cannot be greater than the refundable amount"
      );
      return;
    }

    if (this.release.refundAmount < 0) {
      this.toastrMessage.showWarning("Refund amount cannot be negative");
      return;
    }

    const payload = {
      date: this.release.date
        ? moment(this.release.date).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      regNo: this.release.regNo,
      receiptNo: this.release.receiptNo,
      tenantId: this.tenant?.id,
      allotmentId: this.allotment?.id,
      propertyId: this.allotment?.propertyId,
      buildingId: this.allotment?.buildingId,
      unitId: this.allotment?.unitId,
      receiptMode: this.release.receiptMode,
      chequeDraftNo: this.isChequeOrBankTransfer
        ? this.release.chequeDraftNo
        : null,
      chequeDraftDate:
        this.isChequeOrBankTransfer && this.release.chequeDraftDate
          ? moment(this.release.chequeDraftDate).format("YYYY-MM-DD")
          : null,
      remarks: this.release.remarks || "",
      isReleaseDate: this.release.isReleaseDate,
      releaseDate:
        this.release.isReleaseDate && this.release.releaseDate
          ? moment(this.release.releaseDate).format("YYYY-MM-DD")
          : null,
      deleteDues: this.release.deleteDues,
      deleteDuesFromDate:
        this.release.deleteDues && this.release.deleteDuesFromDate
          ? moment(this.release.deleteDuesFromDate).format("YYYY-MM-DD")
          : null,
      totalAmount: this.release.totalRefundable,
      refundAmount: this.release.refundAmount,
      balance: this.release.balance,
      details: this.refundDetails.map((detailItem) => ({
        id: detailItem.id,
        dueDate: detailItem.dueDate,
        serviceName: detailItem.serviceName,
        dueAmount: detailItem.dueAmount,
        receivedAmount: detailItem.receivedAmount,
        refundAmount: detailItem.refundAmount,
      })),
    };

    this.isLoading = true;
    if (this.formStatus === "EDIT" && this.releaseRoomId > 0) {
      this.releaseRoomService
        .update(this.releaseRoomId, payload)
        .pipe(delay(300))
        .subscribe({
          next: (resultUpdateReleaseRoom: any) => {
            this.isLoading = false;
            this.dataChanged = true;
            this.toastrMessage.showSuccessMessage(
              "Release room updated successfully"
            );
            this.onClose.next(resultUpdateReleaseRoom);
            this.bsModalRef.hide();
          },
          error: (error) => {
            this.isLoading = false;
            this.errorHandlingService.errors(error);
          },
        });
    } else {
      this.releaseRoomService
        .create(payload)
        .pipe(delay(300))
        .subscribe({
          next: (resultCreateReleaseRoom: any) => {
            this.isLoading = false;
            this.dataChanged = true;
            this.toastrMessage.showSuccessMessage(
              "Release room record created successfully"
            );
            this.onClose.next(resultCreateReleaseRoom);
            this.bsModalRef.hide();
          },
          error: (error) => {
            this.isLoading = false;
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form?.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form?.dirty) {
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
