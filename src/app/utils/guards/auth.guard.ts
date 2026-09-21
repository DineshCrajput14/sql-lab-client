import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isLoggedIn) {
      if (
        route.data.roles &&
        route.data.roles.indexOf(
          this.authService.authentication.userRoleCode
        ) === -1
      ) {
        this.authService.logout();
        return false;
      }
      return true;
    }

    if (state.url === "/" || !state.url || state.url === "") {
      this.router.navigate(["/home"]);
      return false;
    }

    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.authService.isLoggedIn) {
      this.authService.logout();
      return false;
    }

    if (
      route.data.role &&
      !route.data.role.includes(this.authService.authentication.userRoleCode)
    ) {
      this.authService.logout();
      return false;
    }

    if (route.data.activities?.length) {
      const hasPermission = route.data.activities.some((activity) =>
        this.authService.authentication.allowedAppActivities.includes(activity)
      );

      if (!hasPermission) {
        this.authService.logout();
        return false;
      }
    }

    let activityPermission = "";
    if (route.data.module?.length) {
      this.authService.authentication.allowedAppModules.find(
        (allowedAppModule) => {
          route.data.module.forEach((element) => {
            if (element === allowedAppModule) {
              activityPermission = `${element}.${route.data.resource}.${route.data.activity}`;
            }
          });
        }
      );
    }

    if (this.authService.isLoggedIn) {
      if (
        (route.data.role &&
          !route.data.role.includes(
            this.authService.authentication.userRoleCode
          )) ||
        (route.data.module &&
          route.data.resource &&
          route.data.activity &&
          !this.authService.authentication.allowedAppActivities.includes(
            activityPermission
          ))
      ) {
        this.authService.logout();
        return false;
      }
      return true;
    }

    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
