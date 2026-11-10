import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TestMasterComponent } from "./test-master.component";
import { TestEditorComponent } from "./test-editor/test-editor.component";

import { TestMasterRoutingModule } from "./test-master-routing.module";

import { AgGridModule } from "ag-grid-angular";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [TestMasterComponent, TestEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    ModalModule,
    TestMasterRoutingModule,
  ],
})
export class TestMasterModule {}
