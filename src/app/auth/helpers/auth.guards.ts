import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';

import { AuthenticationService } from 'app/auth/service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   *
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(private _router: Router, 
              private _authenticationService: AuthenticationService) {}

  // canActivate
  canActivate( route: ActivatedRouteSnapshot, 
              state: RouterStateSnapshot ) {

    console.log('PASANDO POR CANACTIVATE');

    const currentUser = this._authenticationService.currentUserValue;

    if (currentUser) {

      // Validar Token
      return this._authenticationService.validateToken()
        .pipe (
          tap( isAuthenticated => {
            if ( !isAuthenticated ){
              this._router.navigate(['/pages/authentication/login-v2'], { queryParams: { returnUrl: state.url } });
            }
          } )
        );

      
        
        // check if route is restricted by role
        if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
          // role not authorised so redirect to not-authorized page
          this._router.navigate(['/pages/miscellaneous/not-authorized']);
          // this._router.navigate(['/pages/authentication/login-v2'], { queryParams: { returnUrl: state.url } });
  
          return false;
        }
      // authorised so return true
       return true;
    }

    // not logged in so redirect to login page with the return url
    this._router.navigate(['/pages/authentication/login-v2'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
