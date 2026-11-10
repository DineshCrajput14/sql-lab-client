import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TestGroupMasterComponent } from "./testgroup-master.component";
const routes: Routes = [
  {
    path: "",
    component: TestGroupMasterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestgroupMasterRoutingModule {}
