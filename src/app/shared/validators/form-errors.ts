import { AbstractControl } from '@angular/forms';

export type FieldMessages = Partial<
  Record<
    | 'required'
    | 'maxlength'
    | 'oneOf'
    | 'monetary'
    | 'min'
    | 'max'
    | 'futureDate'
    | 'percentage'
    | 'email'
    | 'dateOrder',
    string
  >
>;

export function getFieldError(
  control: AbstractControl,
  messages: FieldMessages,
): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  for (const [key, message] of Object.entries(messages)) {
    if (control.errors[key]) {
      return message;
    }
  }

  return 'This field is invalid.';
}

export function invalidFieldClass(control: AbstractControl): Record<string, boolean> {
  return {
    'border-red-500': control.touched && control.invalid,
    'focus:border-red-500': control.touched && control.invalid,
    'focus:ring-red-500/20': control.touched && control.invalid,
  };
}
