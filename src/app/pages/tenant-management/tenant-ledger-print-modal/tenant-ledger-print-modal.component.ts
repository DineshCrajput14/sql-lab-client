import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import moment from "moment";
import { AuthService } from "src/app/utils/services/auth.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-tenant-ledger-print-modal",
  templateUrl: "./tenant-ledger-print-modal.component.html",
  styleUrls: ["./tenant-ledger-print-modal.component.scss"],
})
export class TenantLedgerPrintModalComponent implements OnInit {
  tenant: any = null;
  allotment: any = null;
  fromDate: Date | string = null;
  toDate: Date | string = null;
  openingRow: any = null;
  ledgerRows = [];
  totalRow: any = null;
  ledgerType: string = "RENT";

  get isSecurityLedger(): boolean {
    return this.ledgerType === "SECURITY";
  }

  get modalTitle(): string {
    return this.isSecurityLedger
      ? "Tenant Security Ledger Print Preview"
      : "Tenant Ledger Print Preview";
  }

  get sheetTitle(): string {
    return this.isSecurityLedger ? "TENANT SECURITY LEDGER" : "TENANT LEDGER";
  }

  get docNoColTitle(): string {
    return this.isSecurityLedger ? "Rcpt / Refund No." : "Rcpt No.";
  }

  get creditColTitle(): string {
    return this.isSecurityLedger ? "Refund Amt" : "Rec. Amt";
  }

  isDownloadingPdf: boolean = false;

  companyName: string = "PUMA GROUP OF COMPANIES LTD";
  companySubtitle: string = "LWIPA PUMA PLAZA";
  companyAddress: string = "NO. F701, PLOT NO. 36179/M/A";
  companyCity: string = "NDOLA-KITWE ROAD, NDOLA";
  companyContact: string = "Contact No : +260977872947";
  companyEmail: string = "Email : spuma1968@yahoo.com";

  constructor(
    public bsModalRef: BsModalRef,
    public authService: AuthService,
    private toastrMessage: ToastrMessage
  ) {}

  ngOnInit() {}

  get printDate() {
    return moment().format("DD/MM/YYYY");
  }

  get formattedFromDate() {
    return this.fromDate ? moment(this.fromDate).format("DD/MM/YYYY") : "";
  }

  get formattedToDate() {
    return this.toDate ? moment(this.toDate).format("DD/MM/YYYY") : "";
  }

  get propertyName(): string {
    return this.allotment?.propertyName || "-";
  }

  get blockName(): string {
    return this.allotment?.buildingName || "-";
  }

  get unitNo(): string {
    return this.allotment?.unitNo || "-";
  }

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  formatDate(date: any) {
    return date ? moment(date).format("DD/MM/YY") : "";
  }

  formatAmount(val: any) {
    if (val === null || val === undefined || val === "") return "0.00";
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatBalance(val: any) {
    if (val === null || val === undefined || val === "") return "0.00";
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    if (num < 0) {
      return (
        "-" +
        Math.abs(num).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  print() {
    const printContent = document.getElementById("printableLedgerSheet");
    if (!printContent) {
      return;
    }

    const oldIframe = document.getElementById("ledgerPrintIframe");
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "ledgerPrintIframe";
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
        margin: 5mm 6mm;
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
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        color: #000000;
      }
      .print-page-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
      }
      .receipt-card {
        width: 100% !important;
        max-width: 100% !important;
        height: 135mm !important;
        max-height: 135mm !important;
        min-height: 135mm !important;
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
        text-transform: uppercase !important;
      }
      .company-subtitle {
        font-weight: 700 !important;
        font-size: 10.5px !important;
        margin-top: 1px !important;
        color: #1e3a8a !important;
        text-transform: uppercase !important;
      }
      .company-address, .company-city {
        font-size: 10px !important;
        color: #334155 !important;
        text-transform: uppercase !important;
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
      .receipt-title-text {
        font-size: 11.5px !important;
        font-weight: 800 !important;
        letter-spacing: 2.5px !important;
        text-align: center !important;
        flex: 1 !important;
        text-transform: uppercase !important;
      }
      .receipt-copy-badge {
        font-size: 8.5px !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        color: #cbd5e1 !important;
        text-transform: uppercase !important;
        width: 80px !important;
        text-align: right !important;
      }
      .copy-tag-placeholder {
        width: 80px !important;
      }
      .receipt-meta-box {
        padding: 4px 12px !important;
        border-bottom: 1.5px solid #000000 !important;
        background-color: #ffffff !important;
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
        color: #333333 !important;
      }
      .meta-cln {
        width: 12px !important;
        text-align: center !important;
        font-weight: bold !important;
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
        font-weight: normal !important;
        color: #333333 !important;
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
      .table-ledger {
        width: 100% !important;
        height: 100% !important;
        border-collapse: collapse !important;
      }
      .table-ledger th, .table-ledger td {
        padding: 3px 8px !important;
        font-size: 10.5px !important;
        border-right: 1.5px solid #000000 !important;
        border-bottom: 1px solid #000000 !important;
      }
      .table-ledger th:last-child, .table-ledger td:last-child {
        border-right: none !important;
      }
      .table-ledger thead th {
        border-bottom: 1.5px solid #000000 !important;
        background-color: #f1f5f9 !important;
        color: #0f2b5c !important;
        font-weight: 700 !important;
        font-size: 10.5px !important;
      }
      .col-date { width: 11% !important; text-align: center !important; }
      .col-particulars { width: 22% !important; text-align: left !important; }
      .col-rcpt-no { width: 15% !important; text-align: left !important; }
      .col-due { width: 14% !important; text-align: right !important; }
      .col-rec { width: 14% !important; text-align: right !important; }
      .col-balance { width: 14% !important; text-align: right !important; }
      .col-mode { width: 10% !important; text-align: center !important; }
      .table-ledger.is-security-table .col-date { width: 10% !important; }
      .table-ledger.is-security-table .col-particulars { width: 18% !important; }
      .table-ledger.is-security-table .col-rcpt-no { width: 14% !important; }
      .table-ledger.is-security-table .col-due { width: 12% !important; }
      .table-ledger.is-security-table .col-rec { width: 12% !important; }
      .table-ledger.is-security-table .col-balance { width: 12% !important; }
      .table-ledger.is-security-table .col-mode { width: 10% !important; }
      .spacer-row td {
        height: 100% !important;
        border-bottom: none !important;
      }
      .text-end { text-align: right !important; }
      .text-center { text-align: center !important; }
      .fw-bold { font-weight: 700 !important; }
      .total-row td {
        border-top: 1.5px solid #000000 !important;
        border-bottom: none !important;
        background-color: #f8fafc !important;
        font-weight: 700 !important;
        padding: 3.5px 8px !important;
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
          <title>Tenant_Ledger_${this.tenant?.name || "Print"}</title>
          <style>${printStyles}</style>
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
      const element = document.getElementById("printableLedgerSheet");
      if (!element) {
        this.print();
        this.isDownloadingPdf = false;
        return;
      }
      const html2pdfModule: any = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const safeName = (this.tenant?.name || "Tenant").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      const opt = {
        margin: [6, 8, 6, 8],
        filename: `Tenant_Ledger_${safeName}.pdf`,
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
