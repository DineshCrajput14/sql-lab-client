import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { throwError, Observable, Subject } from "rxjs";
import { IdletimeService } from "./idletime.service";
import { ToastrMessage } from "./toastrmessage.service";
import { environment } from "src/environments/environment";
import { CacheService } from "./cache.service";
import { SettingsService } from "src/app/pages/settings/settings.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  isLoggedIn = false;
  dateFormatForDatePipe: string = "dd/MM/yyyy";
  locale = "en-IN";
  onSettingsUpdate = new Subject<boolean>();

  authentication = {
    username: "",
    userRoleCode: "",
    token: "",
    session: {
      id: 0,
      fromDate: "",
      toDate: "",
      name: "",
    },
    controlPanelSettings: <any>{},
    user: <any>{
      id: null,
      name: "",
      mobileNo: null,
      imageUrl: "",
    },
    allowedAppModules: [],
    allowedAppActivities: [],
    organization: {
      groupOrganization: false,
      assetsBasePath: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: {
        id: 0,
        name: "",
      },
      postalCode: "",
      country: {
        id: 0,
        name: "",
        currency: "",
        currencySymbol: "",
        phoneCode: "",
      },
    },
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private idletimeService: IdletimeService,
    private toastrMessage: ToastrMessage,
    private cacheService: CacheService,
    private settingsService: SettingsService
  ) {
    this.idletimeService.idleStatus.subscribe({
      next: (value) => {
        if (value === "TIMEDOUT") {
          this.logout();
        }
      },
    });
    let authData: any = localStorage.getItem("erpLoginData");
    authData = JSON.parse(authData);
    if (authData && authData.token) {
      this.idletimeService.startWatching();
      this.isLoggedIn = true;
      this.updateAuthToken(authData);
      this.getDateFormatForDatePipe();
    }
  }

  login(username: string, password: string): Observable<any> {
    this.isLoggedIn = false;

    return this.http
      .post(environment.apiBasePath + "v1/authenticate", {
        username,
        password,
      })
      .pipe(
        map((response: any) => {
          const authData = response.data;
          const token = authData.token;
          const user = authData.user;

          if (token && user) {
            this.isLoggedIn = true;
            this.authentication.token = token;
            this.authentication.username = user.name;
            this.authentication.userRoleCode = user.userRoleCode;
            this.authentication.user = {
              id: user.id,
              name: user.name,
              mobileNo: user.mobileNo,
              imageUrl: user.imageUrl,
            };
            this.authentication.organization = authData.organization;
            localStorage.setItem(
              "erpLoginData",
              JSON.stringify({
                id: user.id,
                username: user.name,
                user: {
                  id: user.id,
                  name: user.name,
                  mobileNo: user.mobileNo,
                  imageUrl: user.imageUrl,
                  userRoleCode: user.userRoleCode,
                },
                token: token,
                userRoleCode: user.userRoleCode,
                organization: authData.organization,
                allowedAppActivities: authData.allowedAppActivities,
                allowedAppModules: authData.allowedAppModules,
                controlPanelSettings: authData.controlPanelSettings,
              })
            );
            return response;
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  sendPasswordLink(email: string) {
    return this.http
      .post(environment.apiBasePath + "auth/forgot-password", {
        email,
      })
      .pipe(
        map(() => {}),
        catchError(this.handleError)
      );
  }

  resetPassword(password: string, token: string = ""): Observable<any> {
    return this.http.put(environment.apiBasePath + "auth/reset-password", {
      password,
      token,
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(environment.apiBasePath + "auth/change-password", {
      oldPassword,
      newPassword,
    });
  }

  private handleError(error: Response) {
    return throwError(error);
  }

  logout(reason: string = ""): void {
    this.isLoggedIn = false;

    this.authentication = {
      username: "",
      userRoleCode: "",
      token: "",
      session: {
        id: 0,
        fromDate: "",
        toDate: "",
        name: "",
      },
      controlPanelSettings: {},
      user: <any>{
        id: null,
        name: "",
        mobileNo: null,
        imageUrl: null,
      },
      allowedAppActivities: [],
      allowedAppModules: [],
      organization: {
        groupOrganization: false,
        assetsBasePath: "",
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: {
          id: undefined,
          name: "",
        },
        postalCode: "",
        country: {
          id: undefined,
          name: "",
          currency: "",
          currencySymbol: "",
          phoneCode: "",
        },
      },
    };

    this.idletimeService.stopWatching();

    this.idletimeService.idleStatus.subscribe({
      next: (value) => {
        localStorage.removeItem("erpLoginData");
        if (value === "TIMEDOUT") {
          this.router.navigate(["/login"], {
            state: { logoutReason: "timeout" },
          });
        } else if (value === "logout") {
          this.router.navigate(["/login"], {
            state: { logoutReason: "logout" },
          });
        } else if (reason === "sessionExpired") {
          this.router.navigate(["/login"], {
            state: { logoutReason: "sessionExpired" },
          });
        } else {
          this.router.navigate(["/login"], {
            state: { logoutReason: "logout" },
          });
        }
      },
    });
    this.cacheService.clearSearchCache();
    this.settingsService.setCurrentTabIndex = 0;
    this.settingsService.setCurrentTabName = "";
    localStorage.clear();
  }

  updateAuthToken(response) {
    const userRoleCode = response.user?.userRoleCode;

    this.authentication = {
      username: response.user?.name,
      userRoleCode: userRoleCode,
      token: response.token,
      session: response.session,
      user: <any>{
        id: response.user?.id,
        name: response.user?.name,
        mobileNo: response.user?.mobileNo,
        imageUrl: response.user?.imageUrl,
        userRoleCode: userRoleCode,
      },
      allowedAppActivities: response.allowedAppActivities || [],
      allowedAppModules: response.allowedAppModules || [],
      organization: response.organization || {},
      controlPanelSettings: response.controlPanelSettings || {},
    };
  }

  isUser(roles) {
    if (
      this.authentication &&
      this.authentication.userRoleCode &&
      (roles || []).length
    ) {
      return roles.includes(this.authentication.userRoleCode);
    }
    return false;
  }

  isModuleAllowed(moduleName: string) {
    if (!moduleName || !(this.authentication.allowedAppModules || []).length) {
      return false;
    }
    let resultObject = this.authentication.allowedAppModules.find(
      (element: string) => {
        return element === moduleName;
      }
    );
    return !!resultObject;
  }

  findActivityPermission(module, resource, activity) {
    if (!this.authentication || this.authentication.userRoleCode === "ADMIN") {
      return true;
    }
    if (Array.isArray(module)) {
      return module.some((moduleName) =>
        this.findActivityPermission(moduleName, resource, activity)
      );
    }

    if (!this.isModuleAllowed(module)) {
      return false;
    }
    let activityPermission = (
      this.authentication.allowedAppActivities || []
    ).find((x) => x === `${module}.${resource}.${activity}`);
    return !!activityPermission;
  }

  getDateFormatForDatePipe() {
    if (
      this.authentication &&
      this.authentication.controlPanelSettings &&
      this.authentication.controlPanelSettings.dateFormat
    ) {
      switch (this.authentication.controlPanelSettings.dateFormat) {
        case "DD/MM/YYYY": {
          this.dateFormatForDatePipe = "dd/MM/yyyy";
          break;
        }
        case "DD-MM-YYYY": {
          this.dateFormatForDatePipe = "dd-MM-yyyy";
          break;
        }
        case "MM/DD/YYYY": {
          this.dateFormatForDatePipe = "MM/dd/yyyy";
          break;
        }
        case "MM-DD-YYYY": {
          this.dateFormatForDatePipe = "MM-dd-yyyy";
          break;
        }
        default: {
          this.dateFormatForDatePipe = "dd/MM/yyyy";
        }
      }
    }
  }
}
