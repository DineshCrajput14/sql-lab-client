import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { PropertiesComponent } from "./properties.component";
import { PropertiesEditorComponent } from "./properties-editor/properties-editor.component";
import { PropertiesRoutingModule } from "./properties-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [PropertiesComponent, PropertiesEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    PropertiesRoutingModule,
  ],
})
export class PropertiesModule {}
