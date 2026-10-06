import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StandardReportsDataService {
  prepareGridRows(reportCode: string, searchObj: any, rawRows: any[]): any[] {
    if (reportCode === "tenant-register") {
      return (rawRows || []).map((row) => ({
        id: row.id,
        regNo: row.regNo,
        registrationDate: row.registrationDate,
        tenantName: row.tenantName,
        agreementDate: row.agreementDate,
        propertyName: row.propertyName,
        buildingName: row.buildingName,
        unitNo: row.unitNo,
        floorName: row.floorName,
        status: row.status,
      }));
    } else if (reportCode === "monthly-rent-register") {
      return (rawRows || []).map((row) => ({
        id: row.id,
        rcptNo: row.rcptNo,
        rcptDate: row.rcptDate,
        tenantName: row.tenantName,
        regNo: row.regNo,
        buildingName: row.buildingName,
        unitNo: row.unitNo,
        floorName: row.floorName,
        rcptAmount: row.rcptAmount,
        dueMonth: row.dueMonth,
      }));
    } else if (reportCode === "monthly-refund-register") {
      return (rawRows || []).map((row) => ({
        id: row.id,
        rcptNo: row.rcptNo,
        rcptDate: row.rcptDate,
        tenantName: row.tenantName,
        regNo: row.regNo,
        buildingName: row.buildingName,
        unitNo: row.unitNo,
        floorName: row.floorName,
        refundAmount: row.refundAmount,
      }));
    } else if (reportCode === "outstanding") {
      return (rawRows || []).map((row) => ({
        id: row.id,
        regNo: row.regNo,
        tenantName: row.tenantName,
        propertyName: row.propertyName,
        buildingName: row.buildingName,
        unitNo: row.unitNo,
        floorName: row.floorName,
        openingAmount: row.openingAmount,
        dueAmount: row.dueAmount,
        rcptAmount: row.rcptAmount,
        balanceAmount: row.balanceAmount,
        monthlyDues: row.monthlyDues || {},
        monthlyStatus: row.monthlyStatus || {},
        monthlyReceipts: row.monthlyReceipts || {},
        ...(row.monthlyDues || {}),
      }));
    } else if (reportCode === "agreement-expiry") {
      return (rawRows || []).map((row) => ({
        id: row.id,
        propertyName: row.propertyName,
        buildingName: row.buildingName,
        unitNo: row.unitNo,
        tenantName: row.tenantName,
        agreementDate: row.agreementDate,
        agreementExpiry: row.agreementExpiry,
      }));
    }

    return rawRows || [];
  }

  prepareGridPinnedBottomRow(
    reportCode: string,
    searchObj: any,
    gridRows: any[],
    months?: any[]
  ): any[] {
    if (reportCode === "monthly-rent-register") {
      let totalAmount = 0;
      (gridRows || []).forEach((row) => {
        totalAmount += Number(row.rcptAmount) || 0;
      });
      return [
        {
          floorName: "Total",
          rcptAmount: totalAmount.toFixed(2),
        },
      ];
    } else if (reportCode === "monthly-refund-register") {
      let totalAmount = 0;
      (gridRows || []).forEach((row) => {
        totalAmount += Number(row.refundAmount) || 0;
      });
      return [
        {
          floorName: "Total",
          refundAmount: totalAmount.toFixed(2),
        },
      ];
    } else if (reportCode === "outstanding") {
      let totalOpening = 0;
      let totalDue = 0;
      let totalRcpt = 0;
      let totalBalance = 0;
      const monthTotals: { [key: string]: number } = {};
      if (searchObj?.monthwise === "Y" && months && months.length) {
        months.forEach((monthColumn: any) => {
          monthTotals[monthColumn.monthKey] = 0;
        });
      }

      (gridRows || []).forEach((row) => {
        totalOpening += Number(row.openingAmount) || 0;
        totalDue += Number(row.dueAmount) || 0;
        totalRcpt += Number(row.rcptAmount) || 0;
        totalBalance += Number(row.balanceAmount) || 0;
        if (searchObj?.monthwise === "Y" && months && months.length) {
          months.forEach((monthColumn: any) => {
            monthTotals[monthColumn.monthKey] +=
              Number(row[monthColumn.monthKey]) || 0;
          });
        }
      });

      const bottomRow: any = {
        floorName: "Total",
        openingAmount: totalOpening.toFixed(2),
        dueAmount: totalDue.toFixed(2),
        rcptAmount: totalRcpt.toFixed(2),
        balanceAmount: totalBalance.toFixed(2),
      };

      if (searchObj?.monthwise === "Y" && months && months.length) {
        months.forEach((monthColumn: any) => {
          bottomRow[monthColumn.monthKey] = (
            monthTotals[monthColumn.monthKey] || 0
          ).toFixed(2);
        });
      }

      return [bottomRow];
    }
    return [];
  }

  prepareOccupancyRows(searchObject: any, rawUnits: any[]): any[] {
    let filteredUnits = rawUnits || [];

    if (searchObject.propertyId && searchObject.propertyId !== "ALL") {
      filteredUnits = filteredUnits.filter(
        (unit) => String(unit.propertyId) === String(searchObject.propertyId)
      );
    }

    if (searchObject.buildingId && searchObject.buildingId !== "ALL") {
      filteredUnits = filteredUnits.filter(
        (unit) => String(unit.buildingId) === String(searchObject.buildingId)
      );
    }

    if (searchObject.unitId && searchObject.unitId !== "ALL") {
      filteredUnits = filteredUnits.filter(
        (unit) => String(unit.id) === String(searchObject.unitId)
      );
    }

    if (searchObject.status && searchObject.status !== "ALL") {
      const searchStatus = String(searchObject.status).toUpperCase();
      filteredUnits = filteredUnits.filter((unit) => {
        const unitStatus = String(unit.status || "").toUpperCase();
        if (searchStatus === "OCCUPIED") {
          return unitStatus === "OCCUPIED";
        } else if (searchStatus === "VACANT") {
          return unitStatus === "VACANT" || unitStatus === "AVAILABLE";
        } else if (searchStatus === "MAINTENANCE") {
          return (
            unitStatus !== "OCCUPIED" &&
            unitStatus !== "VACANT" &&
            unitStatus !== "AVAILABLE"
          );
        }
        return unitStatus === searchStatus;
      });
    }

    const matrixRows: any[] = [];
    const groupedByProperty = new Map<string, any[]>();

    filteredUnits.forEach((unitItem) => {
      const propertyKey = unitItem.propertyName || "";
      if (!groupedByProperty.has(propertyKey)) {
        groupedByProperty.set(propertyKey, []);
      }
      groupedByProperty.get(propertyKey).push(unitItem);
    });

    groupedByProperty.forEach((propertyUnits, propertyName) => {
      const groupedByBuilding = new Map<string, any[]>();

      propertyUnits.forEach((unitItem) => {
        const buildingKey = unitItem.buildingName || "";
        if (!groupedByBuilding.has(buildingKey)) {
          groupedByBuilding.set(buildingKey, []);
        }
        groupedByBuilding.get(buildingKey).push(unitItem);
      });

      let isFirstPropertyRow = true;

      groupedByBuilding.forEach((buildingUnits, buildingName) => {
        const groupedByFloor = new Map<string, any[]>();

        buildingUnits.forEach((unitItem) => {
          const floorKey = unitItem.floorName || "";
          if (!groupedByFloor.has(floorKey)) {
            groupedByFloor.set(floorKey, []);
          }
          groupedByFloor.get(floorKey).push({
            id: unitItem.id,
            unitNo: unitItem.unitNo,
            propertyId: unitItem.propertyId,
            propertyName: unitItem.propertyName,
            buildingId: unitItem.buildingId,
            buildingName: unitItem.buildingName,
            floorName: unitItem.floorName,
            status: unitItem.status,
            tenantName: unitItem.tenantName,
            allotmentFromDate: unitItem.allotmentFromDate,
            allotmentToDate: unitItem.allotmentToDate,
            rentAmount: unitItem.rentAmount,
          });
        });

        groupedByFloor.forEach((floorUnits, floorName) => {
          matrixRows.push({
            propertyName: propertyName,
            isFirstPropertyRow: isFirstPropertyRow,
            buildingName: buildingName,
            floorName: floorName,
            units: floorUnits,
          });
          isFirstPropertyRow = false;
        });
      });
    });

    return matrixRows;
  }

  calculateOccupancySummary(
    occupancyRows: any[]
  ): {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
  } {
    let totalCount = 0;
    let occupiedCount = 0;
    let vacantCount = 0;
    let maintenanceCount = 0;

    (occupancyRows || []).forEach((row) => {
      (row.units || []).forEach((unit) => {
        totalCount++;
        const st = String(unit.status || "").toUpperCase();
        if (st === "OCCUPIED") {
          occupiedCount++;
        } else if (st === "VACANT" || st === "AVAILABLE") {
          vacantCount++;
        } else if (st === "MAINTENANCE") {
          maintenanceCount++;
        }
      });
    });

    return {
      total: totalCount,
      occupied: occupiedCount,
      vacant: vacantCount,
      maintenance: maintenanceCount,
    };
  }
}
