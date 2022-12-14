import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from 'app/auth/service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  /**
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

  intercept( request: HttpRequest<any>, 
              next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      catchError( ( err: HttpErrorResponse ) => {
        let error = "";
        // console.log("INTERCEPTOR: ", err);
        if ([401, 403].indexOf(err.status) !== -1) {
          // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
          // this._router.navigate(['/pages/miscellaneous/not-authorized']);
          this._router.navigate(['/pages/authentication/login-v2']);
          // ? Can also logout and reload if needed
          // this._authenticationService.logout();
          // location.reload(true);
          error = err.error.message || err.statusText;
        }else if ( err.status === 400 ){
          error = err.error.msg;
        }else {
          error = "Algo se rompió!! :(. Regresa más tarde e intentalo de nuevo.";
        }
        // throwError
        return throwError(error);
      })
    );
  }
}
