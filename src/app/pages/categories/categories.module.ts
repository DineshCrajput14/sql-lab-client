import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { CategoriesComponent } from "./categories.component";
import { CategoriesEditorComponent } from "./categories-editor/categories-editor.component";
import { CategoriesRoutingModule } from "./categories-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [CategoriesComponent, CategoriesEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    CategoriesRoutingModule,
  ],
})
export class CategoriesModule {}
