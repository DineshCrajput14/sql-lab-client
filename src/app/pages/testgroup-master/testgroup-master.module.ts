import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";

import { SharedModule } from "../common/shared.module";
import { TestGroupMasterComponent } from "./testgroup-master.component";
import { TestGroupEditorComponent } from "./testgroup-editor/testgroup-editor.component";
import { TestgroupMasterRoutingModule } from "./testgroup-master-routing.module";
import { EditRendererComponent } from "../common/renderer/edit-rendered.component";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";

@NgModule({
  declarations: [TestGroupMasterComponent, TestGroupEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    SharedModule,
    TestgroupMasterRoutingModule,
  ],
})
export class TestgroupMasterModule {}
