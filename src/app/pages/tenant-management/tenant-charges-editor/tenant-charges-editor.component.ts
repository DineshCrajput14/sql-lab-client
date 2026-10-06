import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import moment from "moment";
import { AuthService } from "src/app/utils/services/auth.service";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
import { CancelService } from "@app/utils/services/cancel.service";

@Component({
  selector: "app-tenant-charges-editor",
  templateUrl: "./tenant-charges-editor.component.html",
})
export class TenantChargesEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;
  defaultColDef = { resizable: true };
  isLoading: boolean;
  dataChanged: boolean = false;
  onClose = new Subject<any>();
  gridChargesSummaryApi;
  gridRowDataChargesSummary = [];
  gridPinnedBottomRowDataChargesSummary = [];
  tenant;
  allotment;
  gridRowDataDueDates = [];
  allDueDates = [];

  gridColumnDefsChargesSummary = [
    {
      headerName: "Head Name",
      field: "serviceName",
      minWidth: 160,
      flex: 2,
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Rent Amount",
      field: "chargeAmount",
      minWidth: 120,
      flex: 1,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return this.formatCurrency(data.value);
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Net Amt.",
      field: "netAmount",
      minWidth: 120,
      flex: 1,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return this.formatCurrency(data.value);
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
  ];

  gridColumnDefsDueDates = [
    {
      headerName: "Due Date",
      field: "dueDate",
      minWidth: 120,
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        if (!data.value) return "";
        const dateValue = moment(data.value);
        return dateValue.isValid()
          ? dateValue.format("DD/MM/YYYY")
          : data.value;
      },
    },
    {
      headerName: "Rent Amount",
      field: "chargeAmount",
      minWidth: 120,
      flex: 1,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return this.formatCurrency(data.value);
      },
    },
    {
      headerName: "Net Amt.",
      field: "netAmount",
      minWidth: 120,
      flex: 1,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return this.formatCurrency(data.value);
      },
    },
    {
      headerName: "Remarks",
      field: "remarks",
      minWidth: 140,
      flex: 1.5,
      sortable: true,
      filter: true,
    },
  ];

  constructor(
    public bsModalRef: BsModalRef,
    private cancelService: CancelService,
    public authService: AuthService
  ) {}

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  formatCurrency(value) {
    const numericValue = Number(value) || 0;
    return (
      this.currencySymbol +
      numericValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  ngOnInit() {
    this.calculateStructure();
  }

  calculateStructure() {
    if (!this.allotment) {
      return;
    }

    let totalMonths = 1;
    const fromMoment = moment(this.allotment.allotmentFrom);
    const toMoment = moment(this.allotment.allotmentTo);

    if (fromMoment.isValid() && toMoment.isValid()) {
      totalMonths =
        (toMoment.year() - fromMoment.year()) * 12 +
        (toMoment.month() - fromMoment.month()) +
        1;
      if (totalMonths <= 0) totalMonths = 1;
      totalMonths = Math.min(totalMonths, 120);
    }

    const summaryList = [];
    this.allDueDates = [];
    const baseRent = Number(this.allotment.charges) || 0;
    const serviceName = this.allotment.serviceName;
    const allotmentRemarks = this.allotment.remarks;

    if (baseRent > 0 && serviceName) {
      const totalRentAmount = baseRent * totalMonths;
      summaryList.push({
        id: 0,
        serviceName: serviceName,
        chargeAmount: totalRentAmount,
        netAmount: totalRentAmount,
      });

      const currentMonth = fromMoment.isValid() ? fromMoment.clone() : moment();
      for (let monthIndex = 0; monthIndex < totalMonths; monthIndex++) {
        this.allDueDates.push({
          chargeId: 0,
          dueDate: currentMonth.clone().startOf("month").format("YYYY-MM-DD"),
          chargeAmount: baseRent,
          netAmount: baseRent,
          remarks: allotmentRemarks,
        });
        currentMonth.add(1, "month");
      }
    }

    const securityAmount = Number(this.allotment.securityAmount) || 0;
    if (securityAmount > 0) {
      summaryList.push({
        id: "security",
        serviceName: "Security",
        chargeAmount: securityAmount,
        netAmount: securityAmount,
      });

      this.allDueDates.push({
        chargeId: "security",
        dueDate: fromMoment.isValid()
          ? fromMoment.format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        chargeAmount: securityAmount,
        netAmount: securityAmount,
        remarks: allotmentRemarks,
      });
    }

    (this.allotment.additionalCharges || []).forEach((additionalCharge) => {
      const chargeRate = Number(additionalCharge.chargeAmount) || 0;
      const isOneTime = additionalCharge.type === "One Time";
      const multiplier = isOneTime ? 1 : totalMonths;
      const totalChargeAmount = chargeRate * multiplier;
      const chargeId = additionalCharge.id;

      summaryList.push({
        id: chargeId,
        serviceName: additionalCharge.serviceName,
        chargeAmount: totalChargeAmount,
        netAmount: totalChargeAmount,
      });

      if (isOneTime) {
        this.allDueDates.push({
          chargeId: chargeId,
          dueDate: fromMoment.isValid()
            ? fromMoment.format("YYYY-MM-DD")
            : moment().format("YYYY-MM-DD"),
          chargeAmount: totalChargeAmount,
          netAmount: totalChargeAmount,
          remarks: allotmentRemarks,
        });
      } else {
        const currentMonth = fromMoment.isValid()
          ? fromMoment.clone()
          : moment();
        for (let monthIndex = 0; monthIndex < totalMonths; monthIndex++) {
          this.allDueDates.push({
            chargeId: chargeId,
            dueDate: currentMonth.clone().startOf("month").format("YYYY-MM-DD"),
            chargeAmount: chargeRate,
            netAmount: chargeRate,
            remarks: allotmentRemarks,
          });
          currentMonth.add(1, "month");
        }
      }
    });

    this.gridRowDataChargesSummary = summaryList;

    let totalChargeAmount = 0;
    let totalNetAmount = 0;
    summaryList.forEach((item) => {
      totalChargeAmount += item.chargeAmount;
      totalNetAmount += item.netAmount;
    });

    this.gridPinnedBottomRowDataChargesSummary = [
      {
        id: "total",
        serviceName: "Total",
        chargeAmount: totalChargeAmount,
        netAmount: totalNetAmount,
        isTotalRow: true,
      },
    ];

    if (summaryList.length > 0) {
      const firstChargeId = summaryList[0].id;
      this.gridRowDataDueDates = this.allDueDates.filter(
        (element) => element.chargeId === firstChargeId
      );
    }
  }

  onChargesSummaryGridReady(params) {
    this.gridChargesSummaryApi = params.api;
    params.api.sizeColumnsToFit();
    if (this.gridRowDataChargesSummary.length > 0) {
      setTimeout(() => {
        params.api.forEachNode((node) => {
          if (node.rowIndex === 0) {
            node.setSelected(true);
          }
        });
      }, 100);
    }
  }

  onDueDatesGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  onChargesSummarySelectionChanged() {
    if (!this.gridChargesSummaryApi) return;
    const selectedRows = this.gridChargesSummaryApi.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedHead = selectedRows[0];
      if (selectedHead.isTotalRow) return;
      this.gridRowDataDueDates = this.allDueDates.filter(
        (element) => element.chargeId === selectedHead.id
      );
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeyEscape() {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
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
}
