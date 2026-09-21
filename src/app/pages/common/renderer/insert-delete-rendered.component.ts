import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "insert-delete-renderer-component",
  template: `
    <button
      type="button"
      class="btn-link edit-delete-button-renderer"
      (click)="onInsert($event)"
      [hidden]="
        !authService.findActivityPermission(
          'Payroll',
          'Transactions',
          'CreateNew'
        ) ||
        !authService.findActivityPermission('HR', 'Transactions', 'CreateNew')
      "
    >
      <i class="fa fa-plus" aria-hidden="true"></i></button
    ><span
      [hidden]="
        !authService.findActivityPermission(
          'Payroll',
          'Transactions',
          'Delete'
        ) || !authService.findActivityPermission('HR', 'Transactions', 'Delete')
      "
      >|</span
    >
    <button
      type="button"
      class="btn-link edit-delete-button-renderer"
      (click)="onDelete($event)"
      [hidden]="
        !authService.findActivityPermission('Payroll', 'Transactions', 'Delete')
      "
    >
      <i class="fas fa-trash-alt text-danger" aria-hidden="true"></i>
    </button>
  `,
})
export class InsertDeleteRendererComponent implements ICellRendererAngularComp {
  params;

  constructor(public authService: AuthService) {}

  agInit(params): void {
    this.params = params;
  }

  refresh(params?): boolean {
    return true;
  }

  onInsert($event) {
    if (this.params.onInsert instanceof Function) {
      this.params.onInsert(this.params.rowIndex);
    }
  }

  onDelete($event) {
    if (this.params.onDelete instanceof Function) {
      this.params.onDelete(this.params.rowIndex);
    }
  }
}
