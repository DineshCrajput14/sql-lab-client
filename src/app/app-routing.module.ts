import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MainComponent } from "./main/main.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { AuthGuard } from "./utils/guards/auth.guard";
import { NonAuthGuard } from "./utils/guards/non-auth.guard";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { ChangePasswordComponent } from "./pages/profile/change-password/change-password.component";
import { PageNotFoundComponent } from "./pages/common/page-not-found/page-not-found.component";

const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: "cities",
        loadChildren: () =>
          import("./pages/cities/cities.module").then((m) => m.CitiesModule),
        data: {
          module: ["Miscellaneous"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "properties",
        loadChildren: () =>
          import("./pages/properties/properties.module").then(
            (m) => m.PropertiesModule
          ),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "buildings",
        loadChildren: () =>
          import("./pages/buildings/buildings.module").then(
            (m) => m.BuildingsModule
          ),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "floor",
        loadChildren: () =>
          import("./pages/floors/floors.module").then((m) => m.FloorsModule),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "floors",
        loadChildren: () =>
          import("./pages/floors/floors.module").then((m) => m.FloorsModule),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "categories",
        loadChildren: () =>
          import("./pages/categories/categories.module").then(
            (m) => m.CategoriesModule
          ),
        data: {
          module: ["Miscellaneous"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "unit",
        loadChildren: () =>
          import("./pages/units/units.module").then((m) => m.UnitsModule),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "units",
        loadChildren: () =>
          import("./pages/units/units.module").then((m) => m.UnitsModule),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "amenities",
        loadChildren: () =>
          import("./pages/amenities/amenities.module").then(
            (m) => m.AmenitiesModule
          ),
        data: {
          module: ["PMS"],
          resource: ["Masters"],
          activity: ["View"],
        },
      },
      {
        path: "users",
        loadChildren: () =>
          import("./pages/users/users.module").then((m) => m.UsersModule),
        data: {
          role: ["ADMIN"],
        },
      },
      {
        path: "tenants",
        loadChildren: () =>
          import("./pages/tenant-management/tenant-management.module").then(
            (m) => m.TenantManagementModule
          ),
        data: {
          module: ["TenantRegistration"],
          resource: ["Transactions"],
          activity: ["View"],
        },
      },
      {
        path: "fee-receipts",
        loadChildren: () =>
          import("./pages/fee-receipts/fee-receipts.module").then(
            (m) => m.FeeReceiptsModule
          ),
        data: {
          module: ["Receipt"],
          resource: ["Transactions"],
          activity: ["View"],
        },
      },
      {
        path: "release-room",
        loadChildren: () =>
          import("./pages/release-room/release-room.module").then(
            (m) => m.ReleaseRoomModule
          ),
        data: {
          module: ["RoomsAllotment"],
          resource: ["Transactions"],
          activity: ["View"],
        },
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./pages/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
        data: {
          role: ["ADMIN"],
        },
      },
      {
        path: "reports/:reportCode",
        loadChildren: () =>
          import(
            "./pages/reports/standard-reports/standard-reports.module"
          ).then((m) => m.StandardReportsModule),
        data: {
          activities: [
            "RegistrationReports.Reports.View",
            "OutstandingReports.Reports.View",
            "OccupancyStatus.Reports.View",
            "AgreementExpiry.Reports.View",
          ],
        },
      },
      {
        path: "tenant-register",
        redirectTo: "reports/tenant-register",
        pathMatch: "full",
      },
      {
        path: "monthly-rent-register",
        redirectTo: "reports/monthly-rent-register",
        pathMatch: "full",
      },
      {
        path: "monthly-refund-register",
        redirectTo: "reports/monthly-refund-register",
        pathMatch: "full",
      },
      {
        path: "outstanding",
        redirectTo: "reports/outstanding",
        pathMatch: "full",
      },
      {
        path: "outstanding-register",
        redirectTo: "reports/outstanding",
        pathMatch: "full",
      },
      {
        path: "occupancy-report",
        redirectTo: "reports/occupancy-report",
        pathMatch: "full",
      },
      {
        path: "occupancy-status",
        redirectTo: "reports/occupancy-report",
        pathMatch: "full",
      },
      {
        path: "agreement-expiry",
        redirectTo: "reports/agreement-expiry",
        pathMatch: "full",
      },
      {
        path: "unit-agreement-status",
        redirectTo: "reports/agreement-expiry",
        pathMatch: "full",
      },
      {
        path: "profile",
        loadChildren: () =>
          import("./pages/profile/profile.module").then((m) => m.ProfileModule),
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
      },
      {
        path: "",
        loadChildren: () =>
          import("./pages/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },
    ],
  },
  {
    path: "home",
    component: LandingComponent,
    canActivate: [NonAuthGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NonAuthGuard],
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
    canActivate: [NonAuthGuard],
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    canActivate: [NonAuthGuard],
  },
  {
    path: "**",
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
