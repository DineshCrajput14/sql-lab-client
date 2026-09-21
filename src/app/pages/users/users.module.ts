import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "../common/shared.module";
import { UsersComponent } from "./users.component";
import { UsersEditorComponent } from "./users-editor/users-editor.component";
import { UsersRoutingModule } from "./users-routing.module";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [UsersComponent, UsersEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
    SharedModule,
    UsersRoutingModule,
  ],
})
export class UsersModule {}
