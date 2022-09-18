import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { ConfirmPasswordValidator } from '../confirm-password.validator';
import { AuthenticationService } from '../../../../auth/service/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth-register-v2',
  templateUrl: './auth-register-v2.component.html',
  styleUrls: ['./auth-register-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthRegisterV2Component implements OnInit {
  // Public
  public coreConfig: any;
  public passwordTextType: boolean;
  public confirmPasswordTextType: boolean;
  public registerForm: UntypedFormGroup;
  public submitted = false;
  public loading = false;
  public error = '';
  public returnUrl: string;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor( private _coreConfigService: CoreConfigService, 
                private _formBuilder: UntypedFormBuilder,
                private _route: ActivatedRoute,
                private _router: Router,
                private _authenticationService: AuthenticationService
                ) {
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Toggle password
   */
   togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * Toggle password
   */
   toggleConfirmPasswordTextType() {
    this.confirmPasswordTextType = !this.confirmPasswordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

      // Login
      this.loading = true;
      this._authenticationService
        .signup( this.registerForm.value )
        // .signup(this.f.username.value, this.f.email.value, this.f.password.value)
      // .pipe(first())
        .subscribe(
          data => {
            console.log("llamada a register component: ", data);
            this._router.navigate([this.returnUrl]);
          },
          err => {
            // console.warn(err);
            this.error = err;
            this.loading = false;
          }
        );

  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.registerForm = this._formBuilder.group({
      username: ['Antonio', [Validators.required]],
      email: ['jattonio@gmail.com', [Validators.required, Validators.email]],
      password: ['1234', Validators.required],
      confirmPassword: ['1234', Validators.required, ],
      privacyPolicy: [true,Validators.requiredTrue]
    }, { validator: ConfirmPasswordValidator('password','confirmPassword') 
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';


    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
