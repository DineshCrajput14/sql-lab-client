import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../common/shared.module";
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsComponent } from "./settings.component";

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, FormsModule, SharedModule, SettingsRoutingModule],
})
export class SettingsModule {}
