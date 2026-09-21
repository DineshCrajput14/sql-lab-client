import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { CitiesComponent } from "./cities.component";
import { CitiesEditorComponent } from "./cities-editor/cities-editor.component";
import { CitiesRoutingModule } from "./cities-routing";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [CitiesComponent, CitiesEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    CitiesRoutingModule,
  ],
})
export class CitiesModule {}
