import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AuthGuard } from "./guards/auth.guard";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { BlobErrorHttpInterceptor } from "./interceptors/blob-error.interceptor";
import { IdletimeModalComponent } from "./components/idletime-modal.component/idletime-modal-modal.component";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";

@NgModule({
  imports: [CommonModule, HttpClientModule, ProgressbarModule.forRoot()],
  declarations: [IdletimeModalComponent],
  exports: [],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlobErrorHttpInterceptor,
      multi: true,
    },
  ],
})
export class UtilsModule {
  constructor(@Optional() @SkipSelf() parentModule: UtilsModule) {}
}
