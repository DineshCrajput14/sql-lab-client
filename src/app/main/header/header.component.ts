import {
  Component,
  OnInit,
  Optional,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AuthService } from "../../utils/services/auth.service";
import { ConfirmModalComponent } from "../../pages/common/confirm-modal/confirm-modal.component";
import { environment } from "src/environments/environment";
import { IdletimeService } from "src/app/utils/services/idletime.service";
import { FeedbackCommentsComponent } from "src/app/pages/feedback-comments/feedback-comments.component";
import { Subject } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @ViewChild("helpAndSupport") helpAndSupport;
  @ViewChild("helpAndSupportMenu") helpAndSupportMenu;
  loginEnvironment = environment.env;
  onClose = new Subject<boolean>();
  currentUrl: string = "";

  constructor(
    public authService: AuthService,
    private modalService: BsModalService,
    @Optional() public bsModalRef: BsModalRef,
    private router: Router,
    private renderer: Renderer2,
    private idletimeService: IdletimeService
  ) {
    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = this.router.url;
        }
      },
    });
  }

  ngOnInit() {}

  hideNavDropdownMenu() {
    if (this.helpAndSupport) {
      this.renderer.removeClass(this.helpAndSupport.nativeElement, "show");
      this.renderer.removeClass(this.helpAndSupportMenu.nativeElement, "show");
    }
  }

  openFeedbackCommentsModal() {
    this.hideNavDropdownMenu();
    const bsModalRef = this.modalService.show(FeedbackCommentsComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-lg",
    });

    if (bsModalRef.content?.onClose) {
      const subscription = bsModalRef.content.onClose.subscribe({
        next: () => {
          subscription.unsubscribe();
        },
      });
    }
  }

  logout() {
    const bsModalRef = this.modalService.show(ConfirmModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: "Do you want to log out?",
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm) => {
        if (resultConfirm) {
          this.authService.logout();
          this.idletimeService.idleStatus.next("logout");
        }
        subscription.unsubscribe();
      },
    });
  }
}
