import { Injectable } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ConfirmModalComponent } from "src/app/pages/common/confirm-modal/confirm-modal.component";

@Injectable({
  providedIn: "root",
})
export class CancelService {
  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  cancel(modal) {
    const bsModalRef = this.modalService.show(ConfirmModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: "Do you want to exit without saving your changes?",
      },
    });
    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm) => {
        if (resultConfirm) {
          bsModalRef.hide();
          modal.hide();
        } else {
          return;
        }
        subscription.unsubscribe();
      },
    });
  }
}
