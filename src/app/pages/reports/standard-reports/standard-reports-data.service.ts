import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StandardReportsDataService {
  prepareGridRows(reportCode, searchObj, reportRows) {
    if (reportCode === "tenant-register") {
      return (reportRows || []).map((reportRow) => ({
        id: reportRow.id,
        regNo: reportRow.regNo,
        registrationDate: reportRow.registrationDate,
        tenantName: reportRow.tenantName,
        agreementDate: reportRow.agreementDate,
        propertyName: reportRow.propertyName,
        buildingName: reportRow.buildingName,
        unitNo: reportRow.unitNo,
        floorName: reportRow.floorName,
        status: reportRow.status,
      }));
    } else if (reportCode === "monthly-rent-register") {
      return (reportRows || []).map((reportRow) => ({
        id: reportRow.id,
        rcptNo: reportRow.rcptNo,
        rcptDate: reportRow.rcptDate,
        tenantName: reportRow.tenantName,
        regNo: reportRow.regNo,
        buildingName: reportRow.buildingName,
        unitNo: reportRow.unitNo,
        floorName: reportRow.floorName,
        rcptAmount: reportRow.rcptAmount,
        dueMonth: reportRow.dueMonth,
      }));
    } else if (reportCode === "monthly-refund-register") {
      return (reportRows || []).map((reportRow) => ({
        id: reportRow.id,
        rcptNo: reportRow.rcptNo,
        rcptDate: reportRow.rcptDate,
        tenantName: reportRow.tenantName,
        regNo: reportRow.regNo,
        buildingName: reportRow.buildingName,
        unitNo: reportRow.unitNo,
        floorName: reportRow.floorName,
        refundAmount: reportRow.refundAmount,
      }));
    } else if (reportCode === "outstanding") {
      return (reportRows || []).map((reportRow) => ({
        id: reportRow.id,
        regNo: reportRow.regNo,
        tenantName: reportRow.tenantName,
        propertyName: reportRow.propertyName,
        buildingName: reportRow.buildingName,
        unitNo: reportRow.unitNo,
        floorName: reportRow.floorName,
        openingAmount: reportRow.openingAmount,
        dueAmount: reportRow.dueAmount,
        rcptAmount: reportRow.rcptAmount,
        balanceAmount: reportRow.balanceAmount,
        monthlyDues: reportRow.monthlyDues || {},
        monthlyStatus: reportRow.monthlyStatus || {},
        monthlyReceipts: reportRow.monthlyReceipts || {},
        ...(reportRow.monthlyDues || {}),
      }));
    } else if (reportCode === "agreement-expiry") {
      return (reportRows || []).map((reportRow) => ({
        id: reportRow.id,
        propertyName: reportRow.propertyName,
        buildingName: reportRow.buildingName,
        unitNo: reportRow.unitNo,
        tenantName: reportRow.tenantName,
        agreementDate: reportRow.agreementDate,
        agreementExpiry: reportRow.agreementExpiry,
      }));
    } else if (reportCode === "occupancy-report") {
      const groupedFloorMap = new Map();

      (reportRows || []).forEach((reportRow) => {
        const groupKey = `${reportRow.propertyName || ""}_${
          reportRow.buildingName || ""
        }_${reportRow.floorName || ""}`;

        if (!groupedFloorMap.has(groupKey)) {
          groupedFloorMap.set(groupKey, {
            propertyName: reportRow.propertyName || "",
            buildingName: reportRow.buildingName || "",
            floorName: reportRow.floorName || "",
            units: [],
          });
        }

        groupedFloorMap.get(groupKey).units.push(reportRow);
      });

      return Array.from(groupedFloorMap.values());
    }

    return reportRows || [];
  }

  prepareGridPinnedBottomRow(reportCode, searchObj, gridRows, months?) {
    if (reportCode === "monthly-rent-register") {
      const totalObject = {
        floorName: "Total",
        rcptAmount: 0,
      };
      (gridRows || []).forEach((reportRow) => {
        totalObject.rcptAmount += Number(reportRow.rcptAmount) || 0;
      });
      return [totalObject];
    } else if (reportCode === "monthly-refund-register") {
      const totalObject = {
        floorName: "Total",
        refundAmount: 0,
      };
      (gridRows || []).forEach((reportRow) => {
        totalObject.refundAmount += Number(reportRow.refundAmount) || 0;
      });
      return [totalObject];
    } else if (reportCode === "outstanding") {
      const totalObject = {
        floorName: "Total",
        openingAmount: 0,
        dueAmount: 0,
        rcptAmount: 0,
        balanceAmount: 0,
      };

      if (searchObj?.monthwise === "Y" && months?.length) {
        months.forEach((monthColumn) => {
          totalObject[monthColumn.monthKey] = 0;
        });
      }

      (gridRows || []).forEach((reportRow) => {
        totalObject.openingAmount += Number(reportRow.openingAmount) || 0;
        totalObject.dueAmount += Number(reportRow.dueAmount) || 0;
        totalObject.rcptAmount += Number(reportRow.rcptAmount) || 0;
        totalObject.balanceAmount += Number(reportRow.balanceAmount) || 0;

        if (searchObj?.monthwise === "Y" && months?.length) {
          months.forEach((monthColumn) => {
            totalObject[monthColumn.monthKey] +=
              Number(reportRow[monthColumn.monthKey]) || 0;
          });
        }
      });

      return [totalObject];
    }

    return [];
  }

  calculateOccupancySummary(occupancyRows) {
    const summary = {
      total: 0,
      occupied: 0,
      vacant: 0,
      maintenance: 0,
    };

    (occupancyRows || []).forEach((reportRow) => {
      (reportRow.units || []).forEach((unit) => {
        summary.total++;
        const status = String(unit.status || "").toUpperCase();
        if (status === "OCCUPIED") {
          summary.occupied++;
        } else if (status === "VACANT" || status === "AVAILABLE") {
          summary.vacant++;
        } else if (status === "MAINTENANCE") {
          summary.maintenance++;
        }
      });
    });

    return summary;
  }
}
