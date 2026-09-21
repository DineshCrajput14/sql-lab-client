import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReleaseRoomComponent } from "./release-room.component";

const routes: Routes = [
  {
    path: "",
    component: ReleaseRoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReleaseRoomRoutingModule {}
