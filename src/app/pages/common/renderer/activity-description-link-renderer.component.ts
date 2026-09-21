import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  template: `
    <span
      (click)="onEdit(this.gridDataObject.id)"
      [hidden]="!this.gridDataObject.detail.length"
      style="color: #007bff; text-decoration:underline; cursor: pointer"
    >
      <i
        class="fa fa-tasks pe-1"
        [hidden]="!this.gridDataObject.detail.length"
        style="color: #007bff;"
      ></i>
      {{ this.gridDataObject.description }}
    </span>
    <span [hidden]="this.gridDataObject.detail.length">
      {{ this.gridDataObject.description }}
    </span>
  `,
})
export class ActivityDescriptionLinkRendererComponent
  implements ICellRendererAngularComp {
  params;
  gridDataObject;

  agInit(params): void {
    this.params = params;
    this.gridDataObject = params.data;
  }

  refresh(params?): boolean {
    return true;
  }

  onEdit($event) {
    if (this.params.onEdit instanceof Function) {
      this.params.onEdit(this.gridDataObject);
    }
  }
}
