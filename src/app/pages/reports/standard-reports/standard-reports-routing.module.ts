import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StandardReportsComponent } from "./standard-reports.component";

const routes: Routes = [
  {
    path: "",
    component: StandardReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StandardReportsRoutingModule {}
