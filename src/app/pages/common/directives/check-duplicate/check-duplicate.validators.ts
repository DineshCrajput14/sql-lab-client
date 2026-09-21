import { UntypedFormGroup } from "@angular/forms";

// custom validator to check that two fields match
export function DuplicateValue(duplicate: string, controlArray: string[]) {
  return (formGroup: UntypedFormGroup) => {
    // return null if controls haven't initialized yet

    if (!formGroup.controls[duplicate]) {
      return null;
    }

    if (!formGroup.controls[duplicate].value) {
      return null;
    }

    // return null if another validator has already found an error on the matchingControl
    if (
      formGroup.controls[duplicate].errors &&
      !formGroup.controls[duplicate].errors.duplicateValue
    ) {
      return null;
    }

    const valueArray = [];
    controlArray.forEach((element) => {
      valueArray.push(formGroup.controls[element]?.value);
    });
    // set error on duplicate value found
    if (
      checkForDuplicates(valueArray, formGroup.controls[duplicate].value) > 1
    ) {
      formGroup.controls[duplicate].setErrors({ duplicateValue: true });
    } else {
      formGroup.controls[duplicate].setErrors(null);
    }
  };
}

function checkForDuplicates(array, checkValue) {
  let valuesAlreadySeen = [];
  array.forEach((element) => {
    if (element === checkValue) {
      valuesAlreadySeen.push(checkValue);
    }
  });
  return valuesAlreadySeen.length;
}
