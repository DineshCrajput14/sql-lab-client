import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../common/shared.module";
import { DashboardComponent } from "./dashboard.component";
import { DashboardRoutingModule } from "./dashboard-routing";
@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, DashboardRoutingModule],
  declarations: [DashboardComponent],
  providers: [],
})
export class DashboardModule {}
