import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AuthService } from "src/app/utils/services/auth.service";
import html2pdf from "html2pdf.js";

@Component({
  selector: "app-lab-test-print-modal",
  templateUrl: "./lab-test-print-modal.component.html",
  styleUrls: ["./lab-test-print-modal.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabTestPrintModalComponent {
  testtranid: number;
  patientData: any = {};
  selectedTests: any[] = [];
  isGeneratingPDF: boolean = false;
  get organization() {
    return this.authService?.authentication?.organization;
  }

  constructor(
    public bsModalRef: BsModalRef,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  isTestBold(test: any): boolean {
    return (
      test?.prnbold === true || test?.prnbold === 1 || test?.prnbold === "1"
    );
  }

  isOutOfRange(test: any): boolean {
    if (!test?.testvalue || !test?.normalvaluem) {
      return false;
    }

    const value = Number(test.testvalue);
    const range = String(test.normalvaluem);

    const match = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);

    if (!match) {
      return false;
    }

    const min = Number(match[1]);
    const max = Number(match[2]);

    return value < min || value > max;
  }

  getReferenceRange(test: any): string {
    if (!test) {
      return "";
    }

    const gender = String(this.patientData?.gender || "").toLowerCase();

    if (gender === "female") {
      return test.normalvaluef || test.normalvaluem || "";
    }

    return test.normalvaluem || test.normalvaluef || "";
  }

  printReport(): void {
    const reportElement = document.querySelector(".print-report");

    if (!reportElement) {
      console.error("Print report element not found");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      alert("Please allow pop-ups to print the report.");
      return;
    }

    // Copy existing CSS stylesheets
    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((style) => style.outerHTML)
      .join("\n");

    printWindow.document.open();

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Lab Test Report</title>

        ${styles}

        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .print-report {
            width: 100%;
            font-family: Arial, sans-serif;
            color: #000;
          }
        </style>
      </head>

      <body>
        ${reportElement.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  async downloadPDF(): Promise<void> {
    if (this.isGeneratingPDF) {
      return;
    }

    console.log("testtranid:", this.testtranid);
    console.log("patientData:", this.patientData);
    const reportElement = document.querySelector(
      ".print-report"
    ) as HTMLElement;

    if (!reportElement) {
      console.error("Print report element not found");
      return;
    }

    this.isGeneratingPDF = true;

    try {
      // Clone report
      const reportClone = reportElement.cloneNode(true) as HTMLElement;

      // Hide original footer from HTML
      const htmlFooter = reportClone.querySelector(
        ".report-footer"
      ) as HTMLElement;

      if (htmlFooter) {
        htmlFooter.style.display = "none";
      }

      // PDF Options
      const options = {
        margin: [10, 10, 35, 10] as [number, number, number, number],

        filename: `LabTestReport_${this.testtranid || "Report"}.pdf`,

        image: {
          type: "jpeg" as const,
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: 0,
        },

        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },

        pagebreak: {
          mode: ["css", "legacy"] as ["css", "legacy"],
          avoid: ["tr", ".group-header"],
        },
      };

      // Generate PDF
      const pdf = await html2pdf()
        .set(options)
        .from(reportClone)
        .toPdf()
        .get("pdf");

      // Get page information
      const totalPages = pdf.internal.getNumberOfPages();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add Footer to Every Page
      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);

        const footerY = pageHeight - 25;

        // Signature Font
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);

        // Left Signature
        pdf.text("Lab Technician Signature", 10, footerY);

        // Right Signature
        pdf.text("Authorized Signatory Signature", pageWidth - 10, footerY, {
          align: "right",
        });

        // Footer Note
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        pdf.text(
          "This is a computer generated laboratory report.",
          pageWidth / 2,
          pageHeight - 15,
          { align: "center" }
        );
      }

      // Download PDF
      // pdf.save(`LabTestReport_${this.testtranid || "Report"}.pdf`);
      const fileName = `LabTestReport_${this.testtranid}.pdf`;

      console.log("PDF filename:", fileName);

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation failed:", error);

      alert("PDF generation failed. Please try again.");
    } finally {
      this.isGeneratingPDF = false;
      this.cdr.detectChanges();
    }
  }
}
