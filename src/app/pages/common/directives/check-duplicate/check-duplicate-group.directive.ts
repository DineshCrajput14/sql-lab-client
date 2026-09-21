import { Directive, Input, forwardRef } from "@angular/core";
import {
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  UntypedFormGroup,
} from "@angular/forms";
import { DuplicateValue } from "./check-duplicate.validators";

interface DuplicateGroupConfig {
  fields: string[];
}

@Directive({
  selector: "[duplicateGroups]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CheckDuplicateGroupsDirective),
      multi: true,
    },
  ],
})
export class CheckDuplicateGroupsDirective implements Validator {
  @Input("duplicateGroups") groupConfigs: DuplicateGroupConfig[] = [];

  validate(formGroup: UntypedFormGroup): ValidationErrors | null {
    if (!(formGroup instanceof UntypedFormGroup)) {
      return null;
    }
    for (const { fields } of this.groupConfigs) {
      for (const name of fields) {
        DuplicateValue(name, fields)(formGroup);
      }
    }
    return null;
  }
}
