import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { SharedModule } from "../../common/shared.module";
import { StandardReportsRoutingModule } from "./standard-reports-routing.module";
import { StandardReportsComponent } from "./standard-reports.component";

@NgModule({
  declarations: [StandardReportsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BsDatepickerModule,
    StandardReportsRoutingModule,
    AgGridModule,
  ],
})
export class StandardReportsModule {}
