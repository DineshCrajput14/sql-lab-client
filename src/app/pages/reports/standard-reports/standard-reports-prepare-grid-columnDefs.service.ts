import { Injectable } from "@angular/core";
import moment from "moment";

@Injectable({
  providedIn: "root",
})
export class StandardReportsPrepareGridColumnDefsService {
  prepareStaticGridColumnDefs(
    reportCode: string,
    search?: any,
    months?: any[]
  ) {
    if (reportCode === "tenant-register") {
      return [
        {
          headerName: "S.No",
          valueGetter: "node.rowIndex + 1",
          width: 80,
          sortable: false,
          filter: false,
          pinned: "left",
          cellClass: "text-center",
        },
        {
          headerName: "Reg. No",
          field: "regNo",
          width: 110,
          sortable: true,
          filter: true,
          pinned: "left",
          cellStyle: { fontWeight: "bold" },
          cellClass: "text-center",
        },
        {
          headerName: "Regn. Date",
          field: "registrationDate",
          width: 130,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            return params.value
              ? moment(params.value).format("DD/MM/YYYY")
              : "";
          },
          cellClass: "text-center",
        },
        {
          headerName: "Tenant Name",
          field: "tenantName",
          width: 200,
          sortable: true,
          filter: true,
          cellStyle: { fontWeight: "500" },
        },
        {
          headerName: "Agreement",
          field: "agreementDate",
          width: 140,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            return params.value
              ? moment(params.value).format("DD/MM/YYYY")
              : "";
          },
          cellClass: "text-center",
        },
        {
          headerName: "Property",
          field: "propertyName",
          width: 160,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Building/Block",
          field: "buildingName",
          width: 160,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Unit",
          field: "unitNo",
          width: 110,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Floor",
          field: "floorName",
          width: 120,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Status",
          field: "status",
          width: 110,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
      ];
    } else if (reportCode === "monthly-rent-register") {
      return [
        {
          headerName: "S.No",
          valueGetter: (params) => {
            if (params.node.rowPinned) return "";
            return params.node.rowIndex + 1;
          },
          width: 80,
          sortable: false,
          filter: false,
          pinned: "left",
          cellClass: "text-center",
        },
        {
          headerName: "RcptNo",
          field: "rcptNo",
          width: 130,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Rcpt Date",
          field: "rcptDate",
          width: 140,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            if (params.node.rowPinned || !params.value) return "";
            return moment(params.value).format("DD/MM/YYYY");
          },
          cellClass: "text-center",
        },
        {
          headerName: "Tenant Name",
          field: "tenantName",
          width: 220,
          sortable: true,
          filter: true,
          cellStyle: (params) =>
            params.node.rowPinned
              ? { fontWeight: "bold" }
              : { fontWeight: "500" },
        },
        {
          headerName: "Reg.No.",
          field: "regNo",
          width: 130,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Building/Block",
          field: "buildingName",
          width: 180,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Unit",
          field: "unitNo",
          width: 110,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Floor",
          field: "floorName",
          width: 120,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-center",
        },
        {
          headerName: "Rcpt Amount",
          field: "rcptAmount",
          width: 160,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        },
        {
          headerName: "Due Month",
          field: "dueMonth",
          width: 280,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
      ];
    } else if (reportCode === "monthly-refund-register") {
      return [
        {
          headerName: "S.No",
          valueGetter: (params) => {
            if (params.node.rowPinned) return "";
            return params.node.rowIndex + 1;
          },
          width: 80,
          sortable: false,
          filter: false,
          pinned: "left",
          cellClass: "text-center",
        },
        {
          headerName: "RcptNo",
          field: "rcptNo",
          width: 130,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Rcpt Date",
          field: "rcptDate",
          width: 140,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            if (params.node.rowPinned || !params.value) return "";
            return moment(params.value).format("DD/MM/YYYY");
          },
          cellClass: "text-center",
        },
        {
          headerName: "Tenant Name",
          field: "tenantName",
          width: 220,
          sortable: true,
          filter: true,
          cellStyle: (params) =>
            params.node.rowPinned
              ? { fontWeight: "bold" }
              : { fontWeight: "500" },
        },
        {
          headerName: "Reg.No.",
          field: "regNo",
          width: 130,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Building/Block",
          field: "buildingName",
          width: 180,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Unit",
          field: "unitNo",
          width: 110,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Floor",
          field: "floorName",
          width: 120,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-center",
        },
        {
          headerName: "Refund Amount",
          field: "refundAmount",
          width: 160,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        },
      ];
    } else if (reportCode === "outstanding") {
      const baseCols: any[] = [
        {
          headerName: "S.No",
          valueGetter: (params) => {
            if (params.node.rowPinned) return "";
            return params.node.rowIndex + 1;
          },
          width: 80,
          sortable: false,
          filter: false,
          pinned: "left",
          cellClass: "text-center",
        },
        {
          headerName: "Reg.No",
          field: "regNo",
          width: 130,
          sortable: true,
          filter: true,
          pinned: "left",
          cellStyle: { fontWeight: "bold" },
          cellClass: "text-center",
        },
        {
          headerName: "Tenant Name",
          field: "tenantName",
          width: 220,
          sortable: true,
          filter: true,
          cellStyle: (params) =>
            params.node.rowPinned
              ? { fontWeight: "bold" }
              : { fontWeight: "500" },
        },
        {
          headerName: "Property",
          field: "propertyName",
          width: 180,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Building/Block",
          field: "buildingName",
          width: 180,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Unit",
          field: "unitNo",
          width: 110,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Floor",
          field: "floorName",
          width: 120,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-center",
        },
        {
          headerName: "Opening Amt",
          field: "openingAmount",
          width: 160,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        },
      ];

      if (search?.monthwise === "Y" && months && months.length) {
        const monthColumns = months.map((monthColumn: any) => ({
          headerName: monthColumn.monthLabel,
          field: monthColumn.monthKey,
          width: 110,
          sortable: true,
          filter: true,
          cellClass: (params: any) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellStyle: (params: any) => {
            if (params.node?.rowPinned) {
              return null;
            }
            const val = Number(params.value) || 0;
            if (val === 0) {
              return null;
            }
            const status = params.data?.monthlyStatus?.[monthColumn.monthKey];
            if (status === "PAID") {
              return {
                backgroundColor: "#00e676",
                color: "#000000",
                fontWeight: "600",
              };
            } else if (status === "UNPAID") {
              return {
                backgroundColor: "#ff1744",
                color: "#ffffff",
                fontWeight: "600",
              };
            } else if (status === "PARTIAL") {
              return {
                backgroundColor: "#ff9100",
                color: "#000000",
                fontWeight: "600",
              };
            }
            return null;
          },
          cellRenderer: (params: any) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
          tooltipValueGetter: (params: any) => {
            if (params.node?.rowPinned) return null;
            const val = Number(params.value) || 0;
            if (val === 0) return null;
            const status = params.data?.monthlyStatus?.[monthColumn.monthKey];
            if (status === "PAID") return `${monthColumn.monthLabel}: Paid`;
            if (status === "UNPAID")
              return `${monthColumn.monthLabel}: Pending`;
            if (status === "PARTIAL")
              return `${monthColumn.monthLabel}: Partial Paid`;
            return null;
          },
        }));
        baseCols.push(...monthColumns);
      }

      baseCols.push(
        {
          headerName: "Due Amount",
          field: "dueAmount",
          width: 160,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        },
        {
          headerName: "Rcpt Amount",
          field: "rcptAmount",
          width: 160,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        },
        {
          headerName: "Balance Amount",
          field: "balanceAmount",
          width: 170,
          sortable: true,
          filter: true,
          cellClass: (params) =>
            params.node.rowPinned ? "text-end fw-bold" : "text-end",
          cellRenderer: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            )
              return "";
            return Number(params.value).toFixed(2);
          },
        }
      );

      return baseCols;
    } else if (reportCode === "agreement-expiry") {
      return [
        {
          headerName: "S.No.",
          valueGetter: "node.rowIndex + 1",
          width: 80,
          sortable: false,
          filter: false,
          pinned: "left",
          cellClass: "text-center",
        },
        {
          headerName: "Property",
          field: "propertyName",
          width: 220,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Block",
          field: "buildingName",
          width: 180,
          sortable: true,
          filter: true,
        },
        {
          headerName: "Unit",
          field: "unitNo",
          width: 120,
          sortable: true,
          filter: true,
          cellClass: "text-center",
        },
        {
          headerName: "Tenant Name",
          field: "tenantName",
          width: 220,
          sortable: true,
          filter: true,
          cellStyle: { fontWeight: "500" },
        },
        {
          headerName: "Agreement Date",
          field: "agreementDate",
          width: 170,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            return params.value
              ? moment(params.value).format("DD/MM/YYYY")
              : "";
          },
          cellClass: "text-center",
        },
        {
          headerName: "Agreement Expiry",
          field: "agreementExpiry",
          width: 195,
          sortable: true,
          filter: true,
          cellRenderer: (params) => {
            return params.value
              ? moment(params.value).format("DD/MM/YYYY")
              : "";
          },
          cellClass: "text-center",
        },
      ];
    } else if (reportCode === "occupancy-report") {
      return [
        {
          headerName: "Property",
          field: "propertyName",
          width: 220,
          sortable: false,
          filter: false,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          },
        },
        {
          headerName: "Block",
          field: "buildingName",
          width: 180,
          sortable: false,
          filter: false,
          cellStyle: { display: "flex", alignItems: "center" },
        },
        {
          headerName: "Floor",
          field: "floorName",
          width: 150,
          sortable: false,
          filter: false,
          cellStyle: { display: "flex", alignItems: "center" },
        },
        {
          headerName: "Units",
          field: "units",
          flex: 1,
          sortable: false,
          filter: false,
          cellClass: "occupancy-units-cell",
          cellRenderer: (params) => {
            const units = params.value || [];
            if (!units.length) {
              return '<span class="text-muted small fst-italic">No units on this floor</span>';
            }
            let html =
              '<div class="d-flex flex-wrap gap-2 align-items-center py-2">';
            for (const unit of units) {
              const rawStatus = (unit.status || "").toUpperCase();
              const statusClass =
                rawStatus === "OCCUPIED"
                  ? "status-occupied"
                  : rawStatus === "VACANT" || rawStatus === "AVAILABLE"
                  ? "status-vacant"
                  : "status-maintenance";

              let tooltip = `Unit: ${unit.unitNo}\nStatus: ${
                unit.status || rawStatus
              }`;
              let datesHtml = "";
              if (rawStatus === "OCCUPIED") {
                if (unit.tenantName) {
                  tooltip += `\nTenant: ${unit.tenantName}`;
                }
                if (unit.allotmentFromDate && unit.allotmentToDate) {
                  tooltip += `\nAllotment: ${unit.allotmentFromDate} to ${unit.allotmentToDate}`;
                  datesHtml = `<div class="unit-dates"><div>${unit.allotmentFromDate}</div><div>${unit.allotmentToDate}</div></div>`;
                }
              }

              const safeTooltip = tooltip.replace(/"/g, "&quot;");

              html += `<div class="occupancy-unit-card ${statusClass}" title="${safeTooltip}">
                <div class="unit-no">${unit.unitNo}</div>
                ${datesHtml}
              </div>`;
            }
            html += "</div>";
            return html;
          },
        },
      ];
    }

    return [];
  }
}
