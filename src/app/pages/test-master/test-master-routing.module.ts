import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TestMasterComponent } from "./test-master.component";

const routes: Routes = [
  {
    path: "",
    component: TestMasterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestMasterRoutingModule {}
