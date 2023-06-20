import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function AssignTypeMustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        //console.log(control.value?.split('-')[0]);
        //console.log(matchingControl.value.code);

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if(control.value&&matchingControl?.value){
          if (control.value?.split('-')[0] !== matchingControl?.value?.code) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
        }

    }
}
