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
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
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
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
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
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
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
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
    } else if (reportCode === "occupancy-report") {
      const exportRows: any[] = [];
      let serialNumber = 1;
      (reportDataRaw || []).forEach((row) => {
        (row.units || []).forEach((unit) => {
          exportRows.push({
            "S.No": serialNumber++,
            Property: row.propertyName,
            Block: row.buildingName,
            Floor: row.floorName,
            "Unit No": unit.unitNo,
            Status: unit.status,
            "Tenant Name": unit.tenantName || "",
            "From Date": unit.allotmentFromDate || "",
            "To Date": unit.allotmentToDate || "",
          });
        });
      });

      const exportFileName =
        fileName || `Occupancy_Status_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
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
        fileName || `Unit_Agreement_Status_${moment().format("DD_MM_YYYY")}`;
      this.excelService.exportAsExcelFile(exportRows, exportFileName);
    }
  }
}
