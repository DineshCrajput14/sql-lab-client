import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { UnitsComponent } from "./units.component";
import { UnitsEditorComponent } from "./units-editor/units-editor.component";
import { UnitsRoutingModule } from "./units-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [UnitsComponent, UnitsEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    UnitsRoutingModule,
  ],
})
export class UnitsModule {}
