import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { AuthService } from "src/app/utils/services/auth.service";
import * as FileSaver from "file-saver";
import { ErrorHandlingService } from "@app/utils/services/error-handling.service";

@Component({
  template: `
    <div>
      <button
        type="button"
        [hidden]="
          (!authService.findActivityPermission(
            params.data.module,
            params.data.resource,
            'Edit'
          ) ||
            this.params.data.id === this.authService.authentication.user.id) &&
          params?.role !== 'CANDIDATE'
        "
        class="btn btn-link"
        style="font-size: 12px;text-decoration: underline;padding-left: 5px;padding-top: 5px;"
        (click)="onEdit($event)"
      >
        <span [hidden]="params?.role !== 'CANDIDATE'">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-tabler-eye-star pe-1"
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
            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path
              d="M9.608 17.682c-2.558 -.71 -4.76 -2.603 -6.608 -5.682c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"
            />
            <path
              d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"
            /></svg
        ></span>
        <span [hidden]="params?.role === 'CANDIDATE'">
          <svg
            class="feather feather-edit pe-1"
            fill="none"
            width="20"
            height="20"
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
        {{ params?.role === "CANDIDATE" ? "View" : "Edit" }}
      </button>
      <button
        [hidden]="!params?.data?.userFileName"
        type="button"
        class="btn btn-link"
        style="font-size: 12px;text-decoration: underline;padding-left: 5px;padding-top: 5px;"
        (click)="onDownload($event)"
      >
        Download
      </button>
    </div>
  `,
})
export class EditRendererComponent implements ICellRendererAngularComp {
  params;

  editData: {
    id: number;
  };

  constructor(
    public authService: AuthService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  agInit(params): void {
    this.params = params;
    this.editData = {
      id: params.data.id,
    };
  }

  refresh(params?): boolean {
    return true;
  }

  async onDownload($event) {
    const tempURL = this.params.data?.fullUrl;
    const tempFileName = this.params.data?.document?.name;
    try {
      if (tempURL && tempFileName) {
        const fileData = await fetch(tempURL);
        const fileDataBlob = await fileData.blob();
        FileSaver.saveAs(fileDataBlob, tempFileName);
      }
    } catch (error) {
      this.errorHandlingService.errors(error);
    }
  }

  onEdit($event) {
    if (this.params.onEdit instanceof Function) {
      this.params.onEdit(this.editData);
    }
  }
}
