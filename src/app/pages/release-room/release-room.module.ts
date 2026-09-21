import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { SharedModule } from "../common/shared.module";
import { ReleaseRoomRoutingModule } from "./release-room-routing.module";
import { ReleaseRoomComponent } from "./release-room.component";
import { ReleaseRoomEditorComponent } from "./release-room-editor/release-room-editor.component";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";

@NgModule({
  declarations: [ReleaseRoomComponent, ReleaseRoomEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BsDatepickerModule,
    ReleaseRoomRoutingModule,
    AgGridModule.withComponents([EditDeleteRendererComponent]),
  ],
})
export class ReleaseRoomModule {}
