import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgIdleModule } from "@ng-idle/core";
import { ToastrModule } from "ngx-toastr";
import { AgGridModule } from "ag-grid-angular";
import { ModalModule } from "ngx-bootstrap/modal";
import { UtilsModule } from "src/app/utils/utils.module";
import { FileUploadModule } from "ng2-file-upload";
import { FullCalendarModule } from "@fullcalendar/angular";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { NgProgressModule } from "ngx-progressbar";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgProgressHttpModule } from "ngx-progressbar/http";
import { SafePipeModule } from "../../safe-pipe.module";
import { NgProgressRouterModule } from "ngx-progressbar/router";
import { ButtonRendererComponent } from "src/app/utils/renderer/button-renderer.component";
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { TabsModule } from "ngx-bootstrap/tabs";
import { NgChartsModule } from "ng2-charts";
import { CheckDuplicateValueDirective } from "./directives/check-duplicate/check-duplicate-value.directive";
import { CheckDuplicateGroupsDirective } from "./directives/check-duplicate/check-duplicate-group.directive";
import { ArchwizardModule } from "angular-archwizard";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { MustMatchDirective } from "./directives/must-match/must-match.directive";
import { NumbersOnlyDirective } from "./directives/numbers-only.directive";
import { TwoDigitDecimalNumberDirective } from "./directives/two-digit-decimal-number.directive";
import { NoRecordFoundImageComponent } from "./no-record-found-image.component";
import { CommonModule } from "@angular/common";
import { AppIsLoadingComponent } from "./app-is-loading.component";
import { RouterModule } from "@angular/router";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { MultiSelectModule } from "primeng/multiselect";
import { CalendarModule } from "primeng/calendar";
import { TooltipModule } from "primeng/tooltip";
import { ListboxModule } from "primeng/listbox";
import { FilterNumericInputDirective } from "./directives/filter-numeric-input.directive";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { NotificationsBlockComponent } from "../../main/header/notifications/notifications-block/notifications-block.component";
import { NotificationsComponent } from "../../main/header/notifications/notifications.component";
import {
  ModalContainerBlurDirective,
  ModalContentBorderDirective,
} from "./directives/modal-directives/index";

@NgModule({
  declarations: [
    CheckDuplicateValueDirective,
    CheckDuplicateGroupsDirective,
    MustMatchDirective,
    NumbersOnlyDirective,
    FilterNumericInputDirective,
    TwoDigitDecimalNumberDirective,
    ModalContainerBlurDirective,
    ModalContentBorderDirective,
    NoRecordFoundImageComponent,
    AppIsLoadingComponent,
    PageNotFoundComponent,
    NotificationsComponent,
    NotificationsBlockComponent,
  ],
  imports: [
    UtilsModule,
    NgxDocViewerModule,
    FormsModule,
    ArchwizardModule,
    FileUploadModule,
    FullCalendarModule,
    NgChartsModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    NgIdleModule.forRoot(),
    ProgressbarModule.forRoot(),
    CollapseModule.forRoot(),
    NgProgressModule.withConfig({
      spinner: false,
      color: "#1f5381",
      thick: true,
    }),
    NgProgressRouterModule,
    NgProgressHttpModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
    }),
    AgGridModule.withComponents([ButtonRendererComponent]),
    FullCalendarModule,
    FileUploadModule,
    RecaptchaModule,
    SafePipeModule,
    RecaptchaFormsModule,
    ProgressbarModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TooltipModule,
    MultiSelectModule,
    CalendarModule,
    ListboxModule,
    OverlayPanelModule,
  ],
  exports: [
    CheckDuplicateValueDirective,
    CheckDuplicateGroupsDirective,
    MustMatchDirective,
    NumbersOnlyDirective,
    FilterNumericInputDirective,
    TwoDigitDecimalNumberDirective,
    ModalContainerBlurDirective,
    ModalContentBorderDirective,
    ArchwizardModule,
    NgxDocViewerModule,
    UtilsModule,
    TabsModule,
    NgChartsModule,
    FileUploadModule,
    FullCalendarModule,
    TimepickerModule,
    SafePipeModule,
    BsDatepickerModule,
    BsDropdownModule,
    ModalModule,
    NgIdleModule,
    ProgressbarModule,
    CollapseModule,
    NgProgressModule,
    NgProgressHttpModule,
    ToastrModule,
    AgGridModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    NoRecordFoundImageComponent,
    AppIsLoadingComponent,
    ReactiveFormsModule,
    TooltipModule,
    MultiSelectModule,
    CalendarModule,
    ListboxModule,
    OverlayPanelModule,
    NotificationsComponent,
    NotificationsBlockComponent,
  ],
  providers: [
    NumbersOnlyDirective,
    FilterNumericInputDirective,
    TwoDigitDecimalNumberDirective,
  ],
})
export class SharedModule {}
