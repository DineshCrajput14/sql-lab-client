import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MainComponent } from "./main/main.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { HeaderComponent } from "./main/header/header.component";
import { TopNavigationComponent } from "./main/top-navigation/top-navigation.component";
import { ConfirmModalComponent } from "./pages/common/confirm-modal/confirm-modal.component";
import { ButtonRendererComponent } from "./utils/renderer/button-renderer.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { ChangePasswordComponent } from "./pages/profile/change-password/change-password.component";
import { SharedModule } from "./pages/common/shared.module";

import { BsModalRef, ModalModule } from "ngx-bootstrap/modal";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { SafePipeModule } from "./safe-pipe.module";
import { ToastrModule } from "ngx-toastr";
import { FooterComponent } from "./main/footer/footer.component";
import { DeleteModalComponent } from "./pages/common/delete-modal/delete-modal.component";
import { FeedbackCommentsComponent } from "./pages/feedback-comments/feedback-comments.component";
import { FeeReceiptPrintModalComponent } from "./pages/fee-receipts/fee-receipt-print-modal/fee-receipt-print-modal.component";
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent,
    TopNavigationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    ConfirmModalComponent,
    DeleteModalComponent,
    ButtonRendererComponent,
    FeedbackCommentsComponent,
    FeeReceiptPrintModalComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    NgxDocViewerModule,
    SharedModule,
    SafePipeModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      newestOnTop: true,
      tapToDismiss: true,
    }),
  ],
  providers: [BsModalRef],
  bootstrap: [AppComponent],
})
export class AppModule {}
