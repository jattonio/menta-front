import { AbstractControl, FormGroup } from "@angular/forms";

export function ConfirmPasswordValidator( password: string, 
                                            confirmPassword: string
                                        ) {

    return (formGroup: FormGroup) => {

        let control = formGroup.controls[password];
        let matchingControl = formGroup.controls[confirmPassword];

        if ( matchingControl.errors && !matchingControl.errors.confirmPasswordValidator ) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmPasswordValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
    
  }