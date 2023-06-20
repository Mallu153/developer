import { FormGroup } from '@angular/forms';

export function ConfirmedValidator(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        //console.log("validation strat");
        //console.log(control);
        const matchingControl = formGroup.controls[matchingControlName];
        //console.log(matchingControl);
        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }

        if (((control.value?.code != null &&matchingControl.value?.code != null) && (control.value?.name != null && matchingControl.value?.name!= null))&&(control.value?.code === matchingControl.value?.code) && (control.value?.name === matchingControl.value?.name)) {
          //console.log((control.value?.code === matchingControl.value?.code) && (control.value?.name === matchingControl.value?.name));
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}
