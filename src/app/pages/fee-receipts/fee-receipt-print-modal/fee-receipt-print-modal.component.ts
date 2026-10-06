import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import moment from "moment";
import { FeeReceiptsService } from "../fee-receipts.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-fee-receipt-print-modal",
  templateUrl: "./fee-receipt-print-modal.component.html",
  styleUrls: ["./fee-receipt-print-modal.component.scss"],
})
export class FeeReceiptPrintModalComponent implements OnInit {
  receiptId: number;
  receiptData: any = null;
  isLoading: boolean = true;
  isDownloadingPdf: boolean = false;

  monthPeriod: string = "";
  formattedReceiptDate: string = "";
  formattedChequeDate: string = "";

  companyName: string = "PUMA GROUP OF COMPANIES LTD";
  companySubtitle: string = "LWIPA PUMA PLAZA";
  companyAddress: string = "NO. F701, PLOT NO. 36179/M/A";
  companyCity: string = "NDOLA-KITWE ROAD, NDOLA";
  companyContact: string = "Contact No : +260977872947";
  companyEmail: string = "Email : spuma1968@yahoo.com";

  constructor(
    public bsModalRef: BsModalRef,
    private feeReceiptsService: FeeReceiptsService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {
    if (this.receiptId) {
      this.loadPrintData(this.receiptId);
    } else if (this.receiptData) {
      this.processReceiptData(this.receiptData);
      this.isLoading = false;
    }
  }

  loadPrintData(id: number) {
    this.isLoading = true;
    this.feeReceiptsService.getReceiptPrintData(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.rentReceipt) {
          this.processReceiptData(response.rentReceipt);
        } else {
          this.toastrMessage.showWarning("Receipt data not found");
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastrMessage.showErrorMessage(
          "Failed to load receipt print data"
        );
      },
    });
  }

  processReceiptData(receipt) {
    this.receiptData = receipt;

    this.formattedReceiptDate = receipt.receiptDate
      ? moment(receipt.receiptDate).format("DD/MM/YY")
      : "";

    this.formattedChequeDate = receipt.chequeDraftDate
      ? moment(receipt.chequeDraftDate).format("DD/MM/YY")
      : "";

    const details = receipt.details || [];
    if (details.length > 0) {
      const dates = details
        .map((detailItem: any) => detailItem.dueDate)
        .filter((dueDate: any) => !!dueDate)
        .sort();
      if (dates.length > 1) {
        const first = moment(dates[0]).format("MMM-YY");
        const last = moment(dates[dates.length - 1]).format("MMM-YY");
        this.monthPeriod = `${first} To ${last}`;
      } else if (dates.length === 1) {
        this.monthPeriod = moment(dates[0]).format("MMM-YY");
      } else {
        this.monthPeriod = moment(receipt.receiptDate).format("MMM-YY");
      }
    } else {
      this.monthPeriod = moment(receipt.receiptDate).format("MMM-YY");
    }
  }

  get servicesList() {
    return this.receiptData?.details || [];
  }

  get paymentModeLabel() {
    const mode = this.receiptData?.receiptMode;
    if (!mode) {
      return "Cash";
    }
    if (typeof mode === "object" && mode.name) {
      return mode.name;
    }
    return String(mode);
  }

  get receivedAmountInWords(): string {
    const amount = Number(this.receiptData?.receivedAmount);
    if (isNaN(amount) || amount <= 0) {
      return "Zero Only";
    }
    return this.convertToWords(amount);
  }

  private convertToWords(num: number): string {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertChunk = (chunkValue: number): string => {
      let str = "";
      if (chunkValue >= 100) {
        str += ones[Math.floor(chunkValue / 100)] + " Hundred ";
        chunkValue %= 100;
      }
      if (chunkValue >= 20) {
        str +=
          tens[Math.floor(chunkValue / 10)] +
          (chunkValue % 10 !== 0 ? " " + ones[chunkValue % 10] : "") +
          " ";
      } else if (chunkValue > 0) {
        str += ones[chunkValue] + " ";
      }
      return str.trim();
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = "";

    if (integerPart === 0) {
      result = "Zero";
    } else {
      const billions = Math.floor(integerPart / 1000000000);
      const millions = Math.floor((integerPart % 1000000000) / 1000000);
      const thousands = Math.floor((integerPart % 1000000) / 1000);
      const remainder = integerPart % 1000;

      if (billions > 0) {
        result += convertChunk(billions) + " Billion ";
      }
      if (millions > 0) {
        result += convertChunk(millions) + " Million ";
      }
      if (thousands > 0) {
        result += convertChunk(thousands) + " Thousand ";
      }
      if (remainder > 0) {
        result += convertChunk(remainder) + " ";
      }
      result = result.trim();
    }

    if (decimalPart > 0) {
      result += " and " + convertChunk(decimalPart) + "/100";
    }

    result += " Only";
    return result;
  }

  print() {
    const printContent = document.getElementById("printableReceiptSheet");
    if (!printContent) {
      return;
    }

    const oldIframe = document.getElementById("receiptPrintIframe");
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "receiptPrintIframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      return;
    }

    const printStyles = `
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
      }
      .print-page-container {
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        align-items: stretch !important;
        width: 100% !important;
        height: 285mm !important;
        min-height: 285mm !important;
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .tear-divider {
        display: flex !important;
        height: 7mm !important;
        min-height: 7mm !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 9.5px !important;
        font-weight: 600 !important;
        color: #333333 !important;
        text-align: center !important;
        letter-spacing: 1px !important;
      }
      .receipt-card {
        width: 100% !important;
        max-width: 100% !important;
        height: 139mm !important;
        max-height: 139mm !important;
        min-height: 139mm !important;
        border: 1.5px solid #000000 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        box-sizing: border-box !important;
        font-size: 10.5px !important;
        line-height: 1.3 !important;
        background-color: #ffffff !important;
        overflow: hidden !important;
      }
      .receipt-header-box {
        padding: 6px 12px 4px 12px !important;
        border-bottom: 1.5px solid #0f2b5c !important;
        background-color: #f1f5f9 !important;
        text-align: center !important;
      }
      .company-name {
        font-size: 13.5px !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px !important;
        color: #0f2b5c !important;
      }
      .company-subtitle {
        font-weight: 700 !important;
        font-size: 10.5px !important;
        margin-top: 1px !important;
        color: #1e3a8a !important;
      }
      .company-address, .company-city {
        font-size: 10px !important;
        color: #334155 !important;
      }
      .company-contact, .company-email {
        font-size: 9.5px !important;
        color: #334155 !important;
      }
      .receipt-title-box {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 2.5px 12px !important;
        background-color: #0f2b5c !important;
        color: #ffffff !important;
        border-bottom: 1.5px solid #0f2b5c !important;
      }
      .copy-tag-placeholder {
        width: 80px !important;
      }
      .receipt-title-text {
        font-size: 11.5px !important;
        font-weight: 800 !important;
        letter-spacing: 2.5px !important;
        text-align: center !important;
      }
      .receipt-copy-badge {
        width: 80px !important;
        text-align: right !important;
        font-size: 8.5px !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        color: #cbd5e1 !important;
        text-transform: uppercase !important;
      }
      .receipt-meta-box {
        padding: 4px 12px !important;
        border-bottom: 1.5px solid #000000 !important;
      }
      .meta-table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .meta-table td {
        padding: 1.5px 0 !important;
        font-size: 10.5px !important;
        vertical-align: middle !important;
      }
      .meta-lbl {
        width: 95px !important;
        font-weight: normal !important;
      }
      .meta-cln {
        width: 12px !important;
        text-align: center !important;
      }
      .meta-val {
        font-weight: normal !important;
      }
      .tenant-name {
        text-transform: uppercase !important;
        font-weight: bold !important;
      }
      .meta-lbl-right {
        width: 70px !important;
        text-align: right !important;
        padding-right: 4px !important;
      }
      .meta-val-right {
        width: 100px !important;
        text-align: left !important;
      }
      .receipt-table-box {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        border-bottom: 1.5px solid #000000 !important;
      }
      .table-services {
        width: 100% !important;
        height: 100% !important;
        border-collapse: collapse !important;
      }
      .table-services th, .table-services td {
        padding: 3px 8px !important;
        font-size: 10.5px !important;
        border-right: 1.5px solid #000000 !important;
      }
      .table-services th:last-child, .table-services td:last-child {
        border-right: none !important;
      }
      .table-services thead th {
        border-bottom: 1.5px solid #000000 !important;
        background-color: #f1f5f9 !important;
        color: #0f2b5c !important;
        font-weight: 700 !important;
        padding: 3px 8px !important;
      }
      .col-services {
        width: 54% !important;
        text-align: left !important;
      }
      .col-due {
        width: 23% !important;
        text-align: right !important;
      }
      .col-rec {
        width: 23% !important;
        text-align: right !important;
      }
      .spacer-row td {
        height: 100% !important;
        border-bottom: none !important;
      }
      .table-services tfoot {
        border-top: 1.5px solid #000000 !important;
      }
      .mode-remarks-cell {
        vertical-align: top !important;
        padding: 4px 8px !important;
        font-size: 10px !important;
        line-height: 1.35 !important;
        border-right: 1.5px solid #000000 !important;
        text-align: left !important;
        border-top: none !important;
      }
      .mode-text {
        font-weight: normal !important;
      }
      .remarks-text {
        font-weight: normal !important;
        word-break: break-word !important;
      }
      .total-row td {
        border-top: 1px solid #000000 !important;
        padding: 2.5px 8px !important;
      }
      .total-row:first-child td {
        border-top: none !important;
      }
      .receipt-signature-box {
        height: 38px !important;
        padding: 4px 14px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-end !important;
      }
      .amount-in-words {
        font-size: 10px !important;
        color: #000000 !important;
        max-width: 65% !important;
        line-height: 1.25 !important;
        text-align: left !important;
        padding-bottom: 2px !important;
      }
      .signatory-block {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        min-width: 110px !important;
      }
      .sign-line {
        width: 100% !important;
        border-top: 1px solid #475569 !important;
        margin-bottom: 3px !important;
      }
      .auth-signatory {
        font-weight: 700 !important;
        font-size: 10px !important;
        white-space: nowrap !important;
        color: #1e293b !important;
      }
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${
            this.receiptData?.receiptNo || this.receiptData?.id
          }</title>
          <style>
            ${printStyles}
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  }

  async downloadPdf() {
    this.isDownloadingPdf = true;
    try {
      const element = document.getElementById("printableReceiptSheet");
      if (!element) {
        this.print();
        this.isDownloadingPdf = false;
        return;
      }
      const html2pdfModule: any = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const receiptNumber = this.receiptData?.receiptNo;

      const opt = {
        margin: [6, 8, 6, 8],
        filename: `Fee_Receipt_${receiptNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(element).save();
      this.toastrMessage.showSuccessMessage("PDF downloaded successfully");
    } catch (error) {
      this.print();
    } finally {
      this.isDownloadingPdf = false;
    }
  }

  close() {
    this.bsModalRef.hide();
  }
}
