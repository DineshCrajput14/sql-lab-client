import { Directive, Input, forwardRef } from "@angular/core";
import {
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  UntypedFormGroup,
} from "@angular/forms";
import { DuplicateValue } from "./check-duplicate.validators";

@Directive({
  selector: "[duplicateValue]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CheckDuplicateValueDirective),
      multi: true,
    },
  ],
})
export class CheckDuplicateValueDirective implements Validator {
  @Input("duplicateValue") duplicateValues: string[] = [];

  validate(formGroup: UntypedFormGroup): ValidationErrors | null {
    for (const name of this.duplicateValues) {
      DuplicateValue(name, this.duplicateValues)(formGroup);
    }
    return null;
  }
}
