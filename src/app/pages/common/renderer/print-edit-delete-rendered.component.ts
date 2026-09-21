import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  template: `
    <div class="d-flex align-items-center">
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer px-1"
        style="font-size: 12px; text-decoration: underline; padding-left: 5px; padding-top: 5px;"
        (click)="onPrint($event)"
      >
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            class="bi bi-printer pe-1"
            viewBox="0 0 16 16"
          >
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
            <path
              d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"
            />
          </svg>
        </span>
        Print
      </button>
      <span>|</span>
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer px-1"
        style="font-size: 12px; text-decoration: underline; padding-left: 5px; padding-top: 5px;"
        (click)="onEdit($event)"
      >
        <span>
          <svg
            class="feather feather-edit pe-1"
            fill="none"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
        Edit
      </button>
      <span>|</span>
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer text-danger px-1"
        style="font-size: 12px; text-decoration: underline; padding-left: 5px; padding-top: 5px;"
        (click)="onDelete($event)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler-trash pe-1"
          width="18"
          height="18"
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
export class PrintEditDeleteRendererComponent
  implements ICellRendererAngularComp {
  params: any;

  agInit(params: any) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    this.params = params;
    return true;
  }

  onPrint($event: Event) {
    if (this.params?.onPrint instanceof Function) {
      this.params.onPrint(this.params.data);
    }
  }

  onEdit($event: Event) {
    if (this.params?.onEdit instanceof Function) {
      this.params.onEdit(this.params.data);
    }
  }

  onDelete($event: Event) {
    if (this.params?.onDelete instanceof Function) {
      this.params.onDelete(this.params.data);
    }
  }
}
