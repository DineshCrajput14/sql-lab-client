import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { BuildingsComponent } from "./buildings.component";
import { BuildingsEditorComponent } from "./buildings-editor/buildings-editor.component";
import { BuildingsRoutingModule } from "./buildings-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [BuildingsComponent, BuildingsEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    BuildingsRoutingModule,
  ],
})
export class BuildingsModule {}
