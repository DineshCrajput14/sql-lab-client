import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  template: `
    <button
      type="button"
      class="btn btn-link"
      style="font-size: 12px;text-decoration: underline;padding-left: 5px;padding-top: 5px;"
      (click)="onActivate($event)"
      [hidden]="editData.isActive"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="icon-tabler-square-rounded-plus pe-1"
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
        <path
          d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"
        />
        <path d="M15 12h-6" />
        <path d="M12 9v6" />
      </svg>
      Activate</button
    ><span [hidden]="editData.isActive">|</span>
    <button
      type="button"
      class="btn btn-link"
      style="font-size: 12px;text-decoration: underline;padding-left: 7px;padding-top: 5px;"
      (click)="onEdit($event)"
    >
      <span>
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
      Edit</button
    ><span [hidden]="editData.isActive">|</span>
    <button
      type="button"
      class="btn btn-link text-danger"
      style="font-size: 12px;text-decoration: underline;padding-left: 7px;padding-top: 5px;"
      (click)="onDelete($event)"
      [hidden]="editData.isActive || editData.rowCount === 1"
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
  `,
})
export class ActivateRendererComponent implements ICellRendererAngularComp {
  params;
  editData: {
    id: number;
    isActive: boolean;
    lastRecordId: number;
    rowCount: number;
  };
  deleteData: {
    id: number;
    isActive: boolean;
  };
  activateData: {
    id: number;
    name: string;
    isActive: boolean;
    fromDate: string;
    toDate: string;
  };

  agInit(params): void {
    this.params = params;
    this.editData = {
      id: params.data.id,
      isActive: params.data.isActive,
      lastRecordId: params.data.lastRecordId,
      rowCount: params.data.rowCount,
    };
    this.deleteData = {
      id: params.data.id,
      isActive: params.data.isActive,
    };
    this.activateData = {
      id: params.data.id,
      name: params.data.name,
      isActive: params.data.isActive,
      fromDate: params.data.fromDate,
      toDate: params.data.toDate,
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

  onDelete($event) {
    if (this.params.onDelete instanceof Function) {
      this.params.onDelete(this.deleteData);
    }
  }

  onActivate($event) {
    if (this.params.onActivate instanceof Function) {
      this.params.onActivate(this.activateData);
    }
  }
}
