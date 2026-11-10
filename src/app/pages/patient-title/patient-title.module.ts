import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { PatientTitleComponent } from "./patient-title.component";
import { PatientTitleEditorComponent } from "./patient-title-editor/patient-title-editor.component";

import { PatientTitleRoutingModule } from "./patient-title-routing.module";

import { AgGridModule } from "ag-grid-angular";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [PatientTitleComponent, PatientTitleEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    ModalModule,
    PatientTitleRoutingModule,
  ],
})
export class PatientTitleModule {}
