import { Injectable } from "@angular/core";
import { ExcelService } from "../../common/export-file.service";
import moment from "moment";

@Injectable({
  providedIn: "root",
})
export class StandardReportsExcelExportService {
  constructor(private excelService: ExcelService) {}

  generateExcelExportFile(
    reportCode: string,
    reportDataRaw: any[],
    fileName?: string,
    searchObj?: any,
    months?: any[]
  ) {
    if (reportCode === "tenant-register") {
      const exportRows = (reportDataRaw || []).map((row, index) => {
        return {
          "S.No": index + 1,
          "Reg. No": row.regNo,
          "Regn. Date": row.registrationDate
            ? moment(row.registrationDate).format("DD/MM/YYYY")
            : "",
          "Tenant Name": row.tenantName,
          Agreement: row.agreementDate
            ? moment(row.agreementDate).format("DD/MM/YYYY")
            : "",
          Property: row.propertyName,
          "Building/Block": row.buildingName,
          Unit: row.unitNo,
          Floor: row.floorName,
          Status: row.status,
        };
      });

      const exportFileName =
        fileName || `Tenant_Register_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Tenant Register",
        searchObj,
        reportCode
      );
    } else if (reportCode === "monthly-rent-register") {
      const exportRows = (reportDataRaw || []).map((row, index) => {
        return {
          "S.No": index + 1,
          RcptNo: row.rcptNo,
          "Rcpt Date": row.rcptDate
            ? moment(row.rcptDate).format("DD/MM/YYYY")
            : "",
          "Tenant Name": row.tenantName,
          "Reg.No.": row.regNo,
          "Building/Block": row.buildingName,
          Unit: row.unitNo,
          Floor: row.floorName,
          "Rcpt Amount": row.rcptAmount
            ? Number(row.rcptAmount).toFixed(2)
            : "",
          "Due Month": row.dueMonth,
        };
      });

      const exportFileName =
        fileName || `Rent_Register_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Rent Register",
        searchObj,
        reportCode
      );
    } else if (reportCode === "monthly-refund-register") {
      const exportRows = (reportDataRaw || []).map((row, index) => {
        return {
          "S.No": index + 1,
          RcptNo: row.rcptNo,
          "Rcpt Date": row.rcptDate
            ? moment(row.rcptDate).format("DD/MM/YYYY")
            : "",
          "Tenant Name": row.tenantName,
          "Reg.No.": row.regNo,
          "Building/Block": row.buildingName,
          Unit: row.unitNo,
          Floor: row.floorName,
          "Refund Amount": row.refundAmount
            ? Number(row.refundAmount).toFixed(2)
            : "",
        };
      });

      const exportFileName =
        fileName || `Refund_Register_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Refund Register",
        searchObj,
        reportCode
      );
    } else if (reportCode === "outstanding") {
      const exportRows = (reportDataRaw || []).map((row, index) => {
        const item: any = {
          "S.No": index + 1,
          "Reg.No": row.regNo,
          "Tenant Name": row.tenantName,
          Property: row.propertyName,
          "Building/Block": row.buildingName,
          Unit: row.unitNo,
          Floor: row.floorName,
          "Opening Amt": row.openingAmount
            ? Number(row.openingAmount).toFixed(2)
            : "0.00",
        };

        if (searchObj?.monthwise === "Y" && months && months.length) {
          months.forEach((monthColumn: any) => {
            item[monthColumn.monthLabel] = row[monthColumn.monthKey]
              ? Number(row[monthColumn.monthKey]).toFixed(2)
              : "0.00";
          });
        }

        item["Due Amount"] = row.dueAmount
          ? Number(row.dueAmount).toFixed(2)
          : "0.00";
        item["Rcpt Amount"] = row.rcptAmount
          ? Number(row.rcptAmount).toFixed(2)
          : "0.00";
        item["Balance Amount"] = row.balanceAmount
          ? Number(row.balanceAmount).toFixed(2)
          : "0.00";

        return item;
      });

      const exportFileName =
        fileName || `Outstanding_Register_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Outstanding Register",
        searchObj,
        reportCode,
        reportDataRaw,
        months
      );
    } else if (reportCode === "occupancy-report") {
      const maxUnitColumns = Math.max(
        ...(reportDataRaw || []).map((row) => (row.units || []).length),
        5
      );
      const exportRows = (reportDataRaw || []).map((row) => {
        const rowItem: Record<string, any> = {
          Property: row.propertyName || "",
          Block: row.buildingName || "",
          Floor: row.floorName || "",
        };
        for (let unitIndex = 0; unitIndex < maxUnitColumns; unitIndex++) {
          const unitColumnKey =
            unitIndex === 0 ? "Units" : `Unit_${unitIndex + 1}`;
          rowItem[unitColumnKey] = row.units?.[unitIndex]?.unitNo || "";
        }
        return rowItem;
      });

      const exportFileName =
        fileName || `Occupancy_Status_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Occupancy Status",
        searchObj,
        reportCode,
        reportDataRaw
      );
    } else if (reportCode === "agreement-expiry") {
      const exportRows = (reportDataRaw || []).map((row, index) => {
        return {
          "S.No.": index + 1,
          Property: row.propertyName,
          Block: row.buildingName,
          Unit: row.unitNo,
          "Tenant Name": row.tenantName,
          "Agreement Date": row.agreementDate
            ? moment(row.agreementDate).format("DD/MM/YYYY")
            : "",
          "Agreement Expiry": row.agreementExpiry
            ? moment(row.agreementExpiry).format("DD/MM/YYYY")
            : "",
        };
      });

      const exportFileName =
        fileName || `Agreement_Status_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportStyledReportExcel(
        exportRows,
        exportFileName,
        "Agreement Status",
        searchObj,
        reportCode
      );
    }
  }
}
