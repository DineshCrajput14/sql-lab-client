import { Injectable } from "@angular/core";
import { AuthService } from "src/app/utils/services/auth.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";

@Injectable({
  providedIn: "root",
})
export class ExcelService {
  constructor(
    private errorHandlingService: ErrorHandlingService,
    private authService: AuthService
  ) {}

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportStyledReportExcel(
    exportRows: Record<string, any>[],
    excelFileName: string,
    reportTitle: string,
    searchObj?: any,
    reportCode?: string,
    rawRows?: any[],
    months?: any[],
    isPrint: boolean = false
  ): void {
    const headers = Object.keys(exportRows?.[0] || {});
    const totalColumns = Math.max(headers.length, 1);
    const lastColumnIndex = totalColumns - 1;

    const isLedger =
      reportCode === "tenant-ledger" || reportCode === "tenant-security-ledger";

    const hasTotalRow =
      reportCode === "monthly-rent-register" ||
      reportCode === "monthly-refund-register" ||
      reportCode === "outstanding";

    const rowsWithTotal = [...(exportRows || [])];
    if (hasTotalRow && rowsWithTotal.length) {
      const totalRow: Record<string, any> = { Floor: "Total" };
      headers.forEach((headerName) => {
        if (
          /amount|amt/i.test(headerName) ||
          /^[a-z]{3}-\d{2,4}$/i.test(headerName.trim())
        ) {
          const columnTotal = (exportRows || []).reduce(
            (sum, rowItem) => sum + (Number(rowItem[headerName]) || 0),
            0
          );
          totalRow[headerName] = columnTotal.toFixed(2);
        }
      });
      rowsWithTotal.push(totalRow);
    }

    const dataRows = rowsWithTotal.map((rowItem) =>
      headers.map((headerName) => rowItem[headerName] ?? "")
    );

    const hasDateFilter = reportCode !== "occupancy-report";
    const hasSearchOption =
      reportCode !== "occupancy-report" &&
      reportCode !== "agreement-expiry" &&
      !isLedger;
    const hasStatusFilter = reportCode !== "agreement-expiry" && !isLedger;

    const displayHeaders = headers.map((headerName) =>
      /^Unit_\d+$/.test(headerName) ? "" : headerName
    );

    const sheetRows = this.buildReportSheetRows(
      reportTitle,
      displayHeaders,
      dataRows,
      searchObj,
      reportCode
    );

    if (isPrint) {
      this.printStyledReport(headers, rowsWithTotal, sheetRows);
      return;
    }

    const merges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumnIndex } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumnIndex } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: lastColumnIndex } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: lastColumnIndex } },
    ];

    if (isLedger) {
      const midCol = Math.floor(totalColumns / 2);
      merges.push(
        { s: { r: 5, c: 0 }, e: { r: 5, c: midCol - 1 } },
        { s: { r: 5, c: midCol }, e: { r: 5, c: lastColumnIndex } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: lastColumnIndex } }
      );
    } else {
      merges.push({
        s: { r: 5, c: 0 },
        e: { r: 5, c: Math.min(hasDateFilter ? 2 : 1, lastColumnIndex) },
      });
      if (hasDateFilter && totalColumns >= 7) {
        merges.push(
          { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } },
          { s: { r: 6, c: 3 }, e: { r: 6, c: 5 } },
          { s: { r: 6, c: 6 }, e: { r: 6, c: Math.min(8, lastColumnIndex) } }
        );
      }
      if (totalColumns >= 9 && hasSearchOption) {
        const searchMergeEndColumn =
          reportCode === "outstanding" ? 7 : Math.min(8, lastColumnIndex - 1);
        merges.push({
          s: { r: 5, c: 6 },
          e: { r: 5, c: searchMergeEndColumn },
        });
      }
    }

    if (reportCode === "occupancy-report" && lastColumnIndex > 3) {
      merges.push({ s: { r: 8, c: 3 }, e: { r: 8, c: lastColumnIndex } });
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetRows);
    worksheet["!merges"] = merges;
    worksheet["!cols"] = this.calculateColumnWidths(
      displayHeaders,
      dataRows,
      reportCode
    );
    worksheet["!rows"] = sheetRows.map((_, rowIndex) => ({
      hpt: rowIndex === 0 ? 22 : rowIndex === 8 ? 20 : 18,
    }));

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const rawExcelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const cellStatusStyleMap = this.buildCellStatusStyleMap(
      headers,
      searchObj,
      reportCode,
      rawRows,
      months
    );
    const totalRowNumber = isLedger
      ? 9 + rowsWithTotal.length
      : hasTotalRow
      ? 9 + rowsWithTotal.length
      : 0;
    const openingRowNumber = isLedger ? 10 : undefined;

    const styledExcelBuffer = this.applyReportStyles(
      rawExcelBuffer,
      headers,
      cellStatusStyleMap,
      totalRowNumber,
      openingRowNumber
    );
    this.saveAsExcelFile(styledExcelBuffer, excelFileName);
  }

  private buildCellStatusStyleMap(
    headers: string[],
    searchObj?: any,
    reportCode?: string,
    rawRows?: any[],
    months?: any[]
  ): Map<string, number> {
    const styleMap = new Map<string, number>();

    if (reportCode === "occupancy-report") {
      (rawRows || []).forEach((rawRow, rowIndex) => {
        const excelRowNumber = 10 + rowIndex;
        (rawRow?.units || []).forEach((unit: any, unitIndex: number) => {
          const unitColumnIndex = 3 + unitIndex;
          const unitStatus = String(unit?.status || "").toUpperCase();
          if (unitStatus === "OCCUPIED") {
            styleMap.set(`${excelRowNumber}:${unitColumnIndex}`, 15);
          } else if (unitStatus === "VACANT" || unitStatus === "AVAILABLE") {
            styleMap.set(`${excelRowNumber}:${unitColumnIndex}`, 14);
          } else if (unitStatus === "MAINTENANCE") {
            styleMap.set(`${excelRowNumber}:${unitColumnIndex}`, 16);
          }
        });
      });
      return styleMap;
    }

    if (
      reportCode !== "outstanding" ||
      searchObj?.monthwise !== "Y" ||
      !months?.length ||
      !rawRows?.length
    ) {
      return styleMap;
    }

    const headerIndexMap = new Map<string, number>();
    headers.forEach((headerName, index) =>
      headerIndexMap.set(headerName, index)
    );

    rawRows.forEach((rawRow, rowIndex) => {
      const excelRowNumber = 10 + rowIndex;
      months.forEach((monthColumn: any) => {
        const columnIndex = headerIndexMap.get(monthColumn.monthLabel);
        const amountValue = Number(rawRow?.[monthColumn.monthKey]) || 0;
        if (columnIndex === undefined || amountValue === 0) {
          return;
        }
        const monthStatus = rawRow?.monthlyStatus?.[monthColumn.monthKey];
        if (monthStatus === "PAID") {
          styleMap.set(`${excelRowNumber}:${columnIndex}`, 11);
        } else if (monthStatus === "UNPAID") {
          styleMap.set(`${excelRowNumber}:${columnIndex}`, 12);
        } else if (monthStatus === "PARTIAL") {
          styleMap.set(`${excelRowNumber}:${columnIndex}`, 13);
        }
      });
    });

    return styleMap;
  }

  private buildReportSheetRows(
    reportTitle: string,
    headers: string[],
    dataRows: (string | number)[][],
    searchObj?: any,
    reportCode?: string
  ): (string | number)[][] {
    const totalColumns = Math.max(headers.length, 1);
    const lastColumnIndex = totalColumns - 1;
    const isLedger =
      reportCode === "tenant-ledger" || reportCode === "tenant-security-ledger";
    const hasDateFilter = reportCode !== "occupancy-report";
    const hasSearchOption =
      reportCode !== "occupancy-report" &&
      reportCode !== "agreement-expiry" &&
      !isLedger;
    const hasStatusFilter = reportCode !== "agreement-expiry" && !isLedger;

    const organization: any = this.authService?.authentication?.organization;
    const addressLine = [
      organization?.addressLine1,
      organization?.addressLine2,
      organization?.city,
    ]
      .filter(Boolean)
      .join(", ");
    const stateName =
      typeof organization?.state === "object"
        ? organization?.state?.name
        : organization?.state;
    const stateAndZip = [stateName, organization?.postalCode]
      .filter(Boolean)
      .join(" ");
    const organizationAddress = [addressLine, stateAndZip]
      .filter(Boolean)
      .join(" - ");

    const fromDate = moment(searchObj?.fromDate || undefined).format(
      "DD/MM/YYYY"
    );
    const toDate = moment(searchObj?.toDate || undefined).format("DD/MM/YYYY");
    const statusValue =
      !searchObj?.status || searchObj.status === "ALL"
        ? "All"
        : searchObj.status;
    const searchKeyword = searchObj?.keyword?.trim()
      ? ` (${searchObj.keyword.trim()})`
      : "";

    const filterRowCells: Record<number, string | number> = {};
    const subFilterRowCells: Record<number, string | number> = {};

    if (hasDateFilter) {
      if (isLedger) {
        const fromDateStr = searchObj?.fromDate
          ? moment(searchObj.fromDate).format("DD-MM-YYYY")
          : "";
        const toDateStr = searchObj?.toDate
          ? moment(searchObj.toDate).format("DD-MM-YYYY")
          : "";
        filterRowCells[0] = `Period: From ${fromDateStr} To ${toDateStr}`;
        const midCol = Math.floor(totalColumns / 2);
        filterRowCells[midCol] = `Dated: ${moment().format("DD-MM-YYYY")}`;
        if (searchObj?.tenantName) {
          subFilterRowCells[0] = `Tenant Name: ${searchObj.tenantName}`;
        }
      } else {
        filterRowCells[0] = `From ${fromDate} to ${toDate}`;
        if (totalColumns >= 7) {
          subFilterRowCells[0] = `Property: ${
            searchObj?.propertyName || "All"
          }`;
          subFilterRowCells[3] = `Block: ${searchObj?.buildingName || "All"}`;
          subFilterRowCells[6] = `Unit: ${searchObj?.unitName || "All"}`;
        }
        if (totalColumns >= 9 && hasSearchOption) {
          filterRowCells[6] = `Search Option: ${
            searchObj?.searchOptionName || "All"
          }${searchKeyword}`;
        }
        if (reportCode === "outstanding" && totalColumns >= 10) {
          filterRowCells[8] = `Monthwise: ${
            searchObj?.monthwise === "Y" ? "Yes" : "No"
          }`;
        }
      }
    } else {
      filterRowCells[0] = `Property: ${searchObj?.propertyName || "All"}`;
      if (totalColumns >= 6) {
        filterRowCells[3] = `Block: ${searchObj?.buildingName || "All"}`;
        filterRowCells[5] = `Unit: ${searchObj?.unitName || "All"}`;
      }
    }

    if (hasStatusFilter) {
      filterRowCells[lastColumnIndex] = `Status: ${statusValue}`;
    }

    const createRow = (cellValues: Record<number, string | number> = {}) =>
      Array.from(
        { length: totalColumns },
        (_, columnIndex) => cellValues[columnIndex] ?? ""
      );

    return [
      createRow({ 0: organization?.name || "" }),
      createRow({ 0: organizationAddress }),
      createRow({ 0: organization?.phoneNo || "" }),
      createRow(),
      createRow({ 0: reportTitle || "" }),
      createRow(filterRowCells),
      createRow(subFilterRowCells),
      createRow(),
      headers,
      ...dataRows,
    ];
  }

  private calculateColumnWidths(
    headers: string[],
    dataRows: (string | number)[][],
    reportCode?: string
  ): XLSX.ColInfo[] {
    return headers.map((headerName, columnIndex) => {
      if (reportCode === "occupancy-report" && columnIndex >= 3) {
        return { wch: 10 };
      }
      const maxCellLength = Math.max(
        headerName.length,
        ...dataRows.map(
          (rowCells) => String(rowCells[columnIndex] ?? "").length
        ),
        columnIndex === headers.length - 1 ? 12 : 6
      );
      return { wch: Math.min(maxCellLength + 4, 32) };
    });
  }

  private applyReportStyles(
    rawExcelBuffer: ArrayBuffer,
    headers: string[],
    cellStatusStyleMap?: Map<string, number>,
    totalRowNumber?: number,
    openingRowNumber?: number
  ): Uint8Array | ArrayBuffer {
    try {
      const zipArchive = XLSX.CFB.read(
        Array.from(new Uint8Array(rawExcelBuffer)),
        { type: "array" }
      );
      const stylesEntry = XLSX.CFB.find(zipArchive, "/xl/styles.xml");
      const worksheetEntry = XLSX.CFB.find(
        zipArchive,
        "/xl/worksheets/sheet1.xml"
      );
      if (!stylesEntry || !worksheetEntry) {
        return rawExcelBuffer;
      }

      const centeredColumnIndices = new Set<number>();
      const rightAlignedColumnIndices = new Set<number>();
      headers.forEach((headerName, columnIndex) => {
        const cleanHeader = headerName.trim();
        if (
          /^(date|mode|s\.?no\.?|sr\.?\s*no\.?|reg\.?\s*no\.?|rcpt\s*no\.?|rcpt\s*\/?\s*refund\s*no\.?)$/i.test(
            cleanHeader
          )
        ) {
          centeredColumnIndices.add(columnIndex);
        } else if (
          /amount|amt|balance/i.test(cleanHeader) ||
          /^[a-z]{3}-\d{2,4}$/i.test(cleanHeader)
        ) {
          rightAlignedColumnIndices.add(columnIndex);
        }
      });

      const createCellStyleXml = (
        fontId: number,
        fillId: number,
        borderId: number,
        alignment: string
      ) =>
        `<xf numFmtId="0" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" applyFont="1" applyFill="${
          fillId ? 1 : 0
        }" applyBorder="${
          borderId ? 1 : 0
        }" applyAlignment="1"><alignment horizontal="${alignment}" vertical="center"/></xf>`;

      const thinBorderXml = ["left", "right", "top", "bottom"]
        .map(
          (side) => `<${side} style="thin"><color rgb="FF000000"/></${side}>`
        )
        .join("");

      const stylesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="4">` +
        `<font><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>` +
        `<font><b/><sz val="13"/><color rgb="FF1F4E78"/><name val="Arial"/></font>` +
        `<font><b/><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>` +
        `<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>` +
        `</fonts>` +
        `<fills count="8">` +
        `<fill><patternFill patternType="none"/></fill>` +
        `<fill><patternFill patternType="gray125"/></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FFD9E1F2"/><bgColor indexed="64"/></patternFill></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FFF2F4F8"/><bgColor indexed="64"/></patternFill></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FF00E676"/><bgColor indexed="64"/></patternFill></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FFFF1744"/><bgColor indexed="64"/></patternFill></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FFFF9100"/><bgColor indexed="64"/></patternFill></fill>` +
        `<fill><patternFill patternType="solid"><fgColor rgb="FFFFEA00"/><bgColor indexed="64"/></patternFill></fill>` +
        `</fills>` +
        `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border>${thinBorderXml}<diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="17">` +
        `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
        [
          createCellStyleXml(1, 0, 1, "center"),
          createCellStyleXml(2, 0, 1, "center"),
          createCellStyleXml(2, 0, 1, "left"),
          createCellStyleXml(2, 2, 1, "left"),
          createCellStyleXml(2, 2, 1, "center"),
          createCellStyleXml(2, 2, 1, "right"),
          createCellStyleXml(0, 0, 1, "left"),
          createCellStyleXml(0, 0, 1, "center"),
          createCellStyleXml(0, 0, 1, "right"),
          createCellStyleXml(2, 0, 1, "right"),
          createCellStyleXml(2, 4, 1, "right"),
          createCellStyleXml(3, 5, 1, "right"),
          createCellStyleXml(2, 6, 1, "right"),
          createCellStyleXml(2, 4, 1, "center"),
          createCellStyleXml(3, 5, 1, "center"),
          createCellStyleXml(2, 7, 1, "center"),
        ].join("") +
        `</cellXfs>` +
        `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/></styleSheet>`;

      const encodeXml = (xmlContent: string) =>
        Array.from(new TextEncoder().encode(xmlContent)) as any;
      stylesEntry.content = encodeXml(stylesXml);

      const worksheetXml = new TextDecoder().decode(
        new Uint8Array(worksheetEntry.content as any)
      );
      worksheetEntry.content = encodeXml(
        worksheetXml.replace(
          /<c r="([A-Z]+)(\d+)"/g,
          (cellMatch, columnLetters, rowNumberText) => {
            const rowNumber = Number(rowNumberText);
            const columnIndex = XLSX.utils.decode_col(columnLetters);
            const statusStyleIndex = cellStatusStyleMap?.get(
              `${rowNumber}:${columnIndex}`
            );
            if (statusStyleIndex) {
              return `<c r="${columnLetters}${rowNumberText}" s="${statusStyleIndex}"`;
            }
            let alignmentOffset = 0;
            if (centeredColumnIndices.has(columnIndex)) {
              alignmentOffset = 1;
            } else if (rightAlignedColumnIndices.has(columnIndex)) {
              alignmentOffset = 2;
            }

            let styleIndex = 0;
            if (rowNumber === 1) {
              styleIndex = 1;
            } else if (rowNumber === 2 || rowNumber === 3 || rowNumber === 5) {
              styleIndex = 2;
            } else if (rowNumber === 6 || rowNumber === 7) {
              styleIndex = columnIndex <= 2 ? 3 : 2;
            } else if (rowNumber === 9) {
              styleIndex = 4 + alignmentOffset;
            } else if (
              (totalRowNumber && rowNumber === totalRowNumber) ||
              (openingRowNumber && rowNumber === openingRowNumber)
            ) {
              styleIndex =
                alignmentOffset === 2 ? 10 : alignmentOffset === 1 ? 2 : 3;
            } else {
              styleIndex = 7 + alignmentOffset;
            }

            return styleIndex
              ? `<c r="${columnLetters}${rowNumberText}" s="${styleIndex}"`
              : cellMatch;
          }
        )
      );

      for (const fileEntry of zipArchive.FileIndex) {
        if (fileEntry?.content) {
          if (!Array.isArray(fileEntry.content)) {
            fileEntry.content = Array.from(
              new Uint8Array(fileEntry.content as any)
            ) as any;
          }
          fileEntry.size = (fileEntry.content as any).length;
        }
      }

      return new Uint8Array(
        XLSX.CFB.write(zipArchive, { fileType: "zip", type: "array" })
      );
    } catch {
      return rawExcelBuffer;
    }
  }

  private printStyledReport(
    headers: string[],
    exportRows: Record<string, any>[],
    sheetRows: (string | number)[][]
  ): void {
    const getColumnAlignment = (headerName: string) => {
      if (/^(reg\.?\s*no\.?|rcpt\s*no\.?)$/i.test(headerName.trim())) {
        return "center";
      }
      if (/amount|amt/i.test(headerName)) {
        return "right";
      }
      return "left";
    };

    const headerCellsHtml = headers
      .map(
        (headerName) =>
          `<th style="text-align:${getColumnAlignment(
            headerName
          )};">${headerName}</th>`
      )
      .join("");

    const bodyRowsHtml = (exportRows || [])
      .map((rowItem) => {
        const rowClass =
          rowItem["Floor"] === "Total" ? ` class="total-row"` : "";
        return `<tr${rowClass}>${headers
          .map(
            (headerName) =>
              `<td style="text-align:${getColumnAlignment(headerName)};">${
                rowItem[headerName] ?? ""
              }</td>`
          )
          .join("")}</tr>`;
      })
      .join("");

    document.getElementById("standardReportPrintIframe")?.remove();
    const printIframe = document.createElement("iframe");
    printIframe.id = "standardReportPrintIframe";
    printIframe.style.cssText =
      "position:fixed;top:-10000px;left:-10000px;width:0;height:0;border:none;";
    document.body.appendChild(printIframe);

    const iframeDocument = printIframe.contentWindow?.document;
    if (!iframeDocument) {
      return;
    }

    const lastColumnIndex = Math.max(headers.length - 1, 0);
    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sheetRows[4]?.[0] || ""}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 10mm; font-family: "Times New Roman", Times, serif; color: #000; background: #fff; }
            .report-box { border: 1px solid #000; min-height: 188mm; width: 100%; }
            .org-header { text-align: center; padding: 8px 12px 2px 12px; line-height: 1.25; }
            .org-name { font-size: 20px; font-weight: bold; }
            .org-line { font-size: 13px; }
            .report-title { font-size: 15px; font-weight: bold; margin-top: 8px; }
            .filter-bar { display: flex; justify-content: space-between; font-size: 10.5px; padding: 2px 6px 5px 6px; }
            .double-top-line { border-top: 1px solid #000; margin-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; border-top: 1px solid #000; border-bottom: 1px solid #000; }
            th, td { border-right: 1px solid #000; padding: 3px 5px; font-size: 10.5px; }
            th:last-child, td:last-child { border-right: none; }
            th { border-bottom: 1px solid #000; font-weight: bold; font-size: 11px; }
            .total-row td { border-top: 1px solid #000; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="report-box">
            <div class="org-header">
              <div class="org-name">${sheetRows[0]?.[0] || ""}</div>
              <div class="org-line">${sheetRows[1]?.[0] || ""}</div>
              <div class="org-line">${sheetRows[2]?.[0] || ""}</div>
              <div class="report-title">${sheetRows[4]?.[0] || ""}</div>
            </div>
            <div class="filter-bar">
              <span>${sheetRows[5]?.[0] || ""}</span>
              <span>${sheetRows[5]?.[lastColumnIndex] || ""}</span>
            </div>
            <div class="double-top-line"></div>
            <table>
              <thead><tr>${headerCellsHtml}</tr></thead>
              <tbody>${bodyRowsHtml}</tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    iframeDocument.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    }, 250);
  }

  private saveAsExcelFile(
    buffer: ArrayBuffer | BlobPart,
    fileName: string
  ): void {
    if (!buffer || !fileName) {
      this.errorHandlingService.errors("Invalid file data or name.");
      return;
    }

    const data = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}
