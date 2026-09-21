import { Injectable } from "@angular/core";
import { Idle, DEFAULT_INTERRUPTSOURCES } from "@ng-idle/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BehaviorSubject } from "rxjs";
import { IdletimeModalComponent } from "../components/idletime-modal.component/idletime-modal-modal.component";

@Injectable({
  providedIn: "root",
})
export class IdletimeService {
  private bsModalRef;
  public idleStatus = new BehaviorSubject("NONE");

  constructor(private idle: Idle, private modalService: BsModalService) {
    idle.setIdle(30 * 60);
    idle.setTimeout(2 * 60);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe({
      next: () => {
        this.closeIdleWarningModal();
      },
    });

    idle.onTimeout.subscribe({
      next: () => {
        this.closeIdleWarningModal();
        this.idleStatus.next("TIMEDOUT");
      },
    });

    idle.onTimeoutWarning.subscribe({
      next: (countdown) => {
        if (!this.bsModalRef) {
          this.bsModalRef = this.modalService.show(IdletimeModalComponent, {
            animated: true,
            backdrop: "static",
            keyboard: true,
            class: "modal-md",
            initialState: {
              countdown,
            },
          });
        }
      },
    });
  }

  closeAllOpenModals() {
    location.reload();
  }

  closeIdleWarningModal() {
    if (this.bsModalRef) {
      const modalContainer = document.body.getElementsByTagName(
        "modal-container"
      );

      for (let i = modalContainer.length; i > 0; i--) {
        if (modalContainer.length) modalContainer[i - 1].remove();
      }

      const bsModalBackdrop = document.body.getElementsByTagName(
        "bs-modal-backdrop"
      );

      for (let i = bsModalBackdrop.length; i > 0; i--) {
        if (bsModalBackdrop.length) bsModalBackdrop[i - 1].remove();
      }

      this.bsModalRef = undefined;
    }
  }

  startWatching() {
    this.idle.stop();
    this.idle.watch();
    this.closeIdleWarningModal();
  }

  stopWatching() {
    this.idle.stop();
    this.closeIdleWarningModal();
  }
}
