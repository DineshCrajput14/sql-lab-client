import {
  Component,
  OnInit,
  Renderer2,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-delete-modal",
  templateUrl: "./delete-modal.component.html",
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  onClose = new Subject<boolean>();
  isConfirm: boolean;
  message: string;
  name: string;

  constructor(
    public bsModalRef: BsModalRef,
    private toastrMessage: ToastrMessage,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.isConfirm) {
      if (document.getElementsByClassName("modal").length > 1) {
        this.renderer.addClass(document.body, "modal-open");
      }
    } else {
      if (document.getElementsByClassName("modal").length > 0) {
        this.renderer.addClass(document.body, "modal-open");
      }
    }
  }

  @HostListener("document:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === "Enter" || event.code === "KeyY") {
      this.confirm();
    } else if (event.code === "Escape" || event.code === "KeyQ") {
      this.decline();
    }
  }

  decline() {
    this.isConfirm = false;
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  confirm() {
    if (!window.navigator.onLine) {
      this.toastrMessage.showOfflineMessage();
    }
    this.isConfirm = true;
    this.onClose.next(true);
    this.bsModalRef.hide();
  }
}
