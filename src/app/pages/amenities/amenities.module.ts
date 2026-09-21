import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { AmenitiesComponent } from "./amenities.component";
import { AmenitiesEditorComponent } from "./amenities-editor/amenities-editor.component";
import { AmenitiesRoutingModule } from "./amenities-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [AmenitiesComponent, AmenitiesEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    AmenitiesRoutingModule,
  ],
})
export class AmenitiesModule {}
