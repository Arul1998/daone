import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ASSET_FIELD_LIMITS } from '../../models/asset';

export function trimmedRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    return value.length > 0 ? null : { required: true };
  };
}

export function oneOf<T extends string>(allowed: readonly T[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    if (!value) {
      return null;
    }

    return allowed.includes(value as T) ? null : { oneOf: { allowed: [...allowed] } };
  };
}

export function optionalMaxLength(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    return value.length <= maxLength ? null : { maxlength: { requiredLength: maxLength, actualLength: value.length } };
  };
}

export function optionalMonetaryValue(
  max = ASSET_FIELD_LIMITS.monetaryMax,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').trim();

    if (!raw) {
      return null;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      return { monetary: true };
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
      return { monetary: true };
    }

    if (value < 0) {
      return { min: { min: 0, actual: value } };
    }

    if (value > max) {
      return { max: { max, actual: value } };
    }

    return null;
  };
}

export function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    if (!value) {
      return null;
    }

    const selected = new Date(`${value}T23:59:59`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return selected > today ? { futureDate: true } : null;
  };
}

export function parseValidatedMonetaryValue(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return Number(trimmed);
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
