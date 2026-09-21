import { Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { CancelService } from "src/app/utils/services/cancel.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { FeedbackCommentsService } from "./feedback-comments.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { environment } from "@environments/environment";

@Component({
  selector: "app-feedback-comments",
  templateUrl: "./feedback-comments.component.html",
})
export class FeedbackCommentsComponent {
  @ViewChild("f") form: NgForm;
  isLoading: boolean;
  dataChanged: boolean;
  onClose = new Subject<boolean>();
  appName: string = environment.appName;

  feedbackComments: {
    name: string;
    mobile: string;
    email: string;
    message: string;
  } = {
    name: "",
    mobile: "",
    email: "",
    message: "",
  };

  constructor(
    public bsModalRef: BsModalRef,
    private feedbackCommentsService: FeedbackCommentsService,
    private errorHandlingService: ErrorHandlingService,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage
  ) {}

  submitFeedback() {
    if (!this.feedbackComments.message) return;

    this.isLoading = true;
    this.dataChanged = true;

    let params = {
      name: this.feedbackComments.name,
      message: this.feedbackComments.message,
      mobile: this.feedbackComments.mobile || "",
      email: this.feedbackComments.email || "",
    };

    this.feedbackCommentsService.submit(params).subscribe({
      next: () => {
        this.onClose.next(this.dataChanged);
        this.bsModalRef.hide();
        this.toastrMessage.showSuccessMessage(
          "Feedback submitted successfully"
        );
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form.dirty) {
      this.cancelService.cancel(this.bsModalRef);
    }
  }
}
