import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-no-record-found-image",
  template: `
    <div [ngStyle]="{ height: height }">
      <p class="text-center font-size-large mt-2">
        No Records Found!
      </p>
      <p
        class="text-center mt-3"
        *ngIf="
          formType !== 'PARENT_MASTER' &&
          permittedToAddNew &&
          masterName !== 'Announcement'
        "
      >
        Please click on
        <strong>Add {{ masterName }}</strong> button to add
        {{
          ["a", "e", "i", "o", "u"].includes(
            masterName?.charAt(0)?.toLowerCase()
          )
            ? "an"
            : "a"
        }}
        {{ masterName
        }}<span *ngIf="isImportFunctional">
          Or click <strong>Import</strong> button to import from an excel
          file</span
        >
      </p>
      <p
        class="text-center mt-3"
        *ngIf="
          formType !== 'PARENT_MASTER' &&
          permittedToAddNew &&
          masterName === 'Announcement'
        "
      >
        Please click on
        <strong>Send New {{ masterName }}</strong> button to add {{ masterName
        }}<span *ngIf="isImportFunctional">
          Or click <strong>Import</strong> button to import from an excel
          file</span
        >
      </p>
      <p
        class="text-center mt-3"
        *ngIf="formType === 'PARENT_MASTER' && permittedToAddNew"
      >
        Please add
        <strong> {{ parentMasterName }}</strong> before adding
        <strong>{{ masterName }}</strong>
      </p>
      <img
        class="rounded mx-auto d-block"
        src="/assets/img/no_record_found.png"
      />
    </div>
  `,
  styles: [
    `
      .font-size-large {
        font-size: large;
      }
      img {
        height: 32vh;
      }
    `,
  ],
})
export class NoRecordFoundImageComponent implements OnInit {
  @Input() masterName: string;
  @Input() isImportFunctional: boolean;
  @Input() permittedToAddNew: boolean;
  @Input() parentMasterName: string;
  @Input() formType: string;
  @Input() customDisplayHeight: string;
  height: string = "60vh";

  constructor() {}
  ngOnInit() {
    this.height = this.customDisplayHeight ? this.customDisplayHeight : "60vh";
  }
}
