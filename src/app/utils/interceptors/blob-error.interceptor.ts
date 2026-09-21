import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class BlobErrorHttpInterceptor implements HttpInterceptor {
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (
          err instanceof HttpErrorResponse &&
          err.error instanceof Blob &&
          err.error.type === "application/json"
        ) {
          // https://stackoverflow.com/a/57530044 for reference and getting to know more about interceptors concepts used in this file.
          return new Promise<any>((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e: Event) => {
              try {
                const errMsg = JSON.parse((<any>e.target).result);
                reject(
                  new HttpErrorResponse({
                    error: errMsg,
                    headers: err.headers,
                    status: err.status,
                    statusText: err.statusText,
                    url: err.url || undefined,
                  })
                );
              } catch (e) {
                reject(err);
              }
            };
            reader.onerror = (e) => {
              reject(err);
            };
            reader.readAsText(err.error);
          });
        }
        return throwError(() => err);
      })
    );
  }
}
