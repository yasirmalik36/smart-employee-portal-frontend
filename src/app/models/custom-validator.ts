import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CustomValidator {
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): any  => {
          if (!control?.value) {
            return;
          }
          const valid = regex.test(control.value);
          return valid ? null : error;
        };
      }
}
