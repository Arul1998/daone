import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function optionalPercentage(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').trim();

    if (!raw) {
      return null;
    }

    if (!/^\d{1,3}(\.\d{1,2})?$/.test(raw)) {
      return { percentage: true };
    }

    const value = Number(raw);

    if (value > 100) {
      return { max: { max: 100, actual: value } };
    }

    return null;
  };
}

export function dateOnOrAfter(startControlName: string, endControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = String(group.get(startControlName)?.value ?? '').trim();
    const end = String(group.get(endControlName)?.value ?? '').trim();
    const endControl = group.get(endControlName);

    if (!start || !end || !endControl) {
      clearDateOrderError(endControl);
      return null;
    }

    if (end < start) {
      endControl.setErrors({ ...endControl.errors, dateOrder: true });
      return { dateOrder: true };
    }

    clearDateOrderError(endControl);
    return null;
  };
}

function clearDateOrderError(control: AbstractControl | null): void {
  if (!control?.errors?.['dateOrder']) {
    return;
  }

  const { dateOrder: _removed, ...rest } = control.errors;
  control.setErrors(Object.keys(rest).length > 0 ? rest : null);
}
