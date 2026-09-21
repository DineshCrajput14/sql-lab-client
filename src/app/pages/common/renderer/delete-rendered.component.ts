import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  template: `
    <div [hidden]="params?.data?.feeHead?.name === 'Total'">
      <button
        type="button"
        [hidden]="
          params?.data?.receivedAmount !== 0 ||
          params?.data?.feeHead?.feeHeadCategory?.id === 2
        "
        class="btn btn-link text-danger"
        style="font-size: 12px;text-decoration: underline;padding-left: 5px;padding-top: 5px;"
        (click)="onDelete($event)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler-trash pe-1"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 7l16 0" />
          <path d="M10 11l0 6" />
          <path d="M14 11l0 6" />
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
        </svg>
        Delete
      </button>
    </div>
  `,
})
export class DeleteRendererComponent implements ICellRendererAngularComp {
  params;

  deleteData: {
    id: number;
    enquiryStatusTypeId: number;
    applicationStatusTypeId: number;
  };

  agInit(params): void {
    this.params = params;
    this.deleteData = {
      id: params.data.id,
      enquiryStatusTypeId: params.data?.enquiryStatusType?.id || undefined,
      applicationStatusTypeId:
        params.data?.applicationStatusType?.id || undefined,
    };
  }

  refresh(params?): boolean {
    return true;
  }

  onDelete($event) {
    if (this.params.onDelete instanceof Function) {
      this.params.onDelete(this.deleteData);
    }
  }
}
