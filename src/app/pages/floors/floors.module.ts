import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { FloorsComponent } from "./floors.component";
import { FloorsEditorComponent } from "./floors-editor/floors-editor.component";
import { FloorsRoutingModule } from "./floors-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [FloorsComponent, FloorsEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    FloorsRoutingModule,
  ],
})
export class FloorsModule {}
