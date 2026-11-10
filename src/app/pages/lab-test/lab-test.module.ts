import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { LabTestComponent } from "./lab-test.component";
import { LabTestEditorComponent } from "./lab-test-editor/lab-test-editor.component";
import { LabTestRoutingModule } from "./lab-test-routing.module";
import { LabTestPrintModalComponent } from './lab-test-print-modal/lab-test-print-modal.component';

@NgModule({
  declarations: [LabTestComponent, LabTestEditorComponent, LabTestPrintModalComponent],
  imports: [CommonModule, FormsModule, HttpClientModule, LabTestRoutingModule],
})
export class LabTestModule {}
