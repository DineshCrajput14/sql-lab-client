import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { PatientTitleComponent } from "./patient-title.component";

const routes: Routes = [
  {
    path: "",
    component: PatientTitleComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientTitleRoutingModule {}
