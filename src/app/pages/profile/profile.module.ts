import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ProfileComponent } from "./profile.component";
import { SharedModule } from "../common/shared.module";
import { ProfileRoutingModule } from "./profile-routing";

@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ProfileRoutingModule],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
