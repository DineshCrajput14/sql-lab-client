import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { TenantManagementRoutingModule } from "./tenant-management-routing.module";
import { TenantManagementComponent } from "./tenant-management.component";
import { TenantEditorComponent } from "./tenant-editor/tenant-editor.component";
import { TenantAllotmentEditorComponent } from "./tenant-allotment-editor/tenant-allotment-editor.component";
import { RentReceiptEditorComponent } from "./rent-receipt-editor/rent-receipt-editor.component";
import { TenantLedgerPrintModalComponent } from "./tenant-ledger-print-modal/tenant-ledger-print-modal.component";
import { TenantChargesEditorComponent } from "./tenant-charges-editor/tenant-charges-editor.component";

@NgModule({
  declarations: [
    TenantManagementComponent,
    TenantEditorComponent,
    TenantAllotmentEditorComponent,
    RentReceiptEditorComponent,
    TenantLedgerPrintModalComponent,
    TenantChargesEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TenantManagementRoutingModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
  ],
})
export class TenantManagementModule {}
