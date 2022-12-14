import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';
import { SignupForm } from '../interfaces/signup.interface';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Admin;
  }

  /**
   *  Confirms if user is client
   */
  get isClient() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Client;
  }

  /**
   * User login
   *
   * @param email
   * @param password
   * @returns user
   */
  login(email: string, password: string) {

    return this._http
      // .post<any>(`${environment.apiUrl}/users/authenticate`, { email, password })
      .post<any>(`${environment.base_url}/login`, { email, password })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            localStorage.setItem('token', user.token);
            console.log('token: ', user.token);
  
            user = user.user;
            user.firstName = user.username.firstname;
            user.lastName = user.username.lastname;
            delete user.username;
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                'Bienvenido, ingresaste como ' +
                  user.role +
                  ' Inicia tu exploraci??n. Enjoy! ????',
                '???? Bienvenido, ' + user.firstName + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.currentUserSubject.next(user);
          }

          return user;
        }, err => {
          throwError (err);
        })
      );
  }


  /**
   * User Signup
   *
   * @param email
   * @param password
   * @returns user
   */
   signup( formData: SignupForm ) {
  // signup(username: string, email: string, password: string) {
      // console.log("Component registro: USERNAME: " + nombre + ' - EMAIL: ' + email + ' - PASSWORD: ' + password);

    return this._http
    .post(`${environment.base_url}/signup`, formData)
    .pipe(
      map( (user: any) => {

        // login successful if there's a jwt token in the response
        if (user && user.token) {

          localStorage.setItem('token', user.token);

          user = user.user;
          user.firstName = user.username.firstname;
          user.lastName = user.username.lastname;
          delete user.username;
      
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Display welcome toast!
          setTimeout(() => {
            this._toastrService.success(
              'Bienvenido, ingresaste como ' +
              user.role +
                ' Inicia tu exploraci??n. Enjoy! ????',
              '???? Bienvenido, ' + user.firstName + '!',
              { toastClass: 'toast ngx-toastr', closeButton: true }
            );
          }, 2500);

          // notify
          this.currentUserSubject.next(user);
        }

      }, err => {
        console.log("AUTHENTICATION SERVICE: ", err);
      }),
    );
  }


  /**
   * Validate Token
   *
   */
  validateToken(): Observable<boolean>  {
    const token = localStorage.getItem('token') || '';

    return this._http.get(`${environment.base_url}/login/renew`,{
      headers: {
        'x-token': token
      }
    })
    .pipe(
      tap( ( resp: any ) => {
        console.log('RESP : ', resp);
        localStorage.setItem('token', resp.token);
      }),
      map( resp => true ),
      catchError( err => of(false) )
    );
  }


  /**
   * User logout
   *
   */
  logout() {
    console.log('... LOGIN OUT ...');
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // notify
    this.currentUserSubject.next(null);
  }
}
