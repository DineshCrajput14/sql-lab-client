import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { FeeReceiptsRoutingModule } from "./fee-receipts-routing.module";
import { FeeReceiptsComponent } from "./fee-receipts.component";
import { PrintEditDeleteRendererComponent } from "../common/renderer/print-edit-delete-rendered.component";

@NgModule({
  declarations: [FeeReceiptsComponent, PrintEditDeleteRendererComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    FeeReceiptsRoutingModule,
    AgGridModule.withComponents([PrintEditDeleteRendererComponent]),
  ],
})
export class FeeReceiptsModule {}
