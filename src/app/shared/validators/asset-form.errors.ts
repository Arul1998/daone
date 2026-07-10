import { AbstractControl, ValidationErrors } from '@angular/forms';

import { ASSET_FIELD_LIMITS } from '../../models/asset';

type AssetFormField =
  | 'name'
  | 'category'
  | 'description'
  | 'purchase_value'
  | 'current_value'
  | 'currency'
  | 'purchase_date'
  | 'ownership_details'
  | 'nominee_name'
  | 'nominee_contact'
  | 'notes';

export function getAssetFieldError(field: AssetFormField, control: AbstractControl): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  const errors = control.errors as ValidationErrors;

  switch (field) {
    case 'name':
      if (errors['required']) return 'Name is required.';
      if (errors['maxlength']) return `Name must be ${ASSET_FIELD_LIMITS.name} characters or fewer.`;
      break;
    case 'category':
      if (errors['required']) return 'Category is required.';
      if (errors['oneOf']) return 'Select a valid category.';
      break;
    case 'description':
      if (errors['maxlength']) return `Description must be ${ASSET_FIELD_LIMITS.description} characters or fewer.`;
      break;
    case 'purchase_value':
    case 'current_value':
      if (errors['monetary']) return 'Enter a valid amount with up to two decimal places.';
      if (errors['min']) return 'Amount cannot be negative.';
      if (errors['max']) return `Amount cannot exceed ${ASSET_FIELD_LIMITS.monetaryMax}.`;
      break;
    case 'currency':
      if (errors['required']) return 'Currency is required.';
      if (errors['oneOf']) return 'Select a valid currency.';
      break;
    case 'purchase_date':
      if (errors['futureDate']) return 'Purchase date cannot be in the future.';
      break;
    case 'ownership_details':
      if (errors['maxlength']) return `Ownership details must be ${ASSET_FIELD_LIMITS.ownership_details} characters or fewer.`;
      break;
    case 'nominee_name':
      if (errors['maxlength']) return `Nominee name must be ${ASSET_FIELD_LIMITS.nominee_name} characters or fewer.`;
      break;
    case 'nominee_contact':
      if (errors['maxlength']) return `Nominee contact must be ${ASSET_FIELD_LIMITS.nominee_contact} characters or fewer.`;
      break;
    case 'notes':
      if (errors['maxlength']) return `Notes must be ${ASSET_FIELD_LIMITS.notes} characters or fewer.`;
      break;
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
