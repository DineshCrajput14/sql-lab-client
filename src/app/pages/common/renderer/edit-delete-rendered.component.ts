import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  template: `
    <div [hidden]="params.data.isSystem">
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer px-1"
        [hidden]="params?.data?.type !== 'CONTENT'"
        (click)="onView($event)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler-eye-cog pe-1"
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
            d="M12 18c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"
          />
          <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M19.001 15.5v1.5" />
          <path d="M19.001 21v1.5" />
          <path d="M22.032 17.25l-1.299 .75" />
          <path d="M17.27 20l-1.3 .75" />
          <path d="M15.97 17.25l1.3 .75" />
          <path d="M20.733 20l1.3 .75" />
        </svg>
        View</button
      ><span [hidden]="params?.data?.type !== 'CONTENT'">|</span>
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer px-1"
        [hidden]="
          (((params?.data?.receiptNumber && params?.data?.rollNumber) ||
            (params?.data?.feeAmount &&
              params?.data?.receivedAmount &&
              params?.data?.feeAmount === params?.data?.receivedAmount) ||
            (params?.data?.concessionAmount &&
              params?.data?.receivedAmount &&
              params?.data?.concessionAmount + params?.data?.receivedAmount ===
                0) ||
            params?.data?.feeHead?.feeHeadCategory?.id === 2 ||
            params?.data?.generationDate ||
            !authService.findActivityPermission(
              params.data.module,
              params.data.resource,
              'Edit'
            )) &&
            authService.authentication.userRoleCode !== 'SUPERADMIN') ||
          params?.data?.status === 'IN_PROGRESS' ||
          params?.data?.status === 'INTERRUPTED' ||
          params?.data?.status === 'SENT'
        "
        (click)="onEdit($event)"
      >
        <span [hidden]="params.data.userFileName">
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
        <i class="fa fa-download pe-1" [hidden]="!params.data.userFileName"></i>
        {{
          params?.data?.userFileName || params?.data?.type === "CONTENT"
            ? "Download"
            : "Edit"
        }}
      </button>
      <span
        [hidden]="
          editData.url ||
          (params?.data?.receivedAmount &&
            params?.data?.receivedAmount !== 0) ||
          !authService.findActivityPermission(
            params.data.module,
            params.data.resource,
            'Edit'
          ) ||
          !authService.findActivityPermission(
            params.data.module,
            params.data.resource,
            'Delete'
          ) ||
          params?.data?.feeHead?.feeHeadCategory?.id === 2 ||
          params?.data?.generationDate ||
          params.data?.exam?.id ||
          params?.data?.status === 'IN_PROGRESS' ||
          params?.data?.status === 'INTERRUPTED' ||
          params?.data?.status === 'SENT'
        "
        >|</span
      >
      <button
        type="button"
        class="btn btn-link edit-delete-button-renderer text-danger px-1"
        [hidden]="
          editData.url ||
          (params?.data?.receivedAmount &&
            params?.data?.receivedAmount !== 0) ||
          params?.data?.feeHead?.feeHeadCategory?.id === 2 ||
          !authService.findActivityPermission(
            params.data.module,
            params.data.resource,
            'Delete'
          ) ||
          params.data?.exam?.id ||
          params?.data?.status === 'IN_PROGRESS' ||
          params?.data?.status === 'INTERRUPTED' ||
          params?.data?.status === 'SENT'
        "
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
export class EditDeleteRendererComponent implements ICellRendererAngularComp {
  params;
  editData: {
    id: number;
    enquiryStatusTypeId: number;
    applicationStatusTypeId: number;
    url: string;
    name: string;
    feeHeadId: number;
    setupExamId: number;
    calculateFromOtherExams: boolean;
  };
  deleteData: {
    id: number;
    enquiryStatusTypeId: number;
    applicationStatusTypeId: number;
  };

  constructor(public authService: AuthService) {}

  agInit(params): void {
    this.params = params;
    this.editData = {
      id: params.data.id,
      enquiryStatusTypeId: params.data?.enquiryStatusType?.id || undefined,
      applicationStatusTypeId:
        params.data?.applicationStatusType?.id || undefined,
      url: params.data?.fullUrl || undefined,
      name: params.data?.userFileName || "",
      feeHeadId: params.data?.feeHeadId || undefined,
      setupExamId: params.data?.exam?.id || undefined,
      calculateFromOtherExams:
        params.data?.exam?.calculateFromOtherExams || undefined,
    };
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

  onEdit($event) {
    if (this.params.onEdit instanceof Function) {
      this.params.onEdit(this.editData);
    }
  }

  onView($event) {
    if (this.params.onView instanceof Function) {
      this.params.onView(this.editData);
    }
  }

  onDelete($event) {
    if (this.params.onDelete instanceof Function) {
      this.params.onDelete(this.deleteData);
    }
  }
}
