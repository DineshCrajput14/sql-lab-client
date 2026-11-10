import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { DoctorsComponent } from "./doctors.component";
import { DoctorsEditorComponent } from "./doctors-editor/doctors-editor.component";
import { DoctorsRoutingModule } from "./doctors-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [DoctorsComponent, DoctorsEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    DoctorsRoutingModule,
  ],
})
export class DoctorsModule {}
