import { AbstractControl } from '@angular/forms';

import { CONTACT_FIELD_LIMITS } from '../../models/trusted-contact';
import { FieldMessages, getFieldError } from './form-errors';

type ContactFormField =
  | 'full_name'
  | 'relationship'
  | 'email'
  | 'phone'
  | 'address'
  | 'notes';

const CONTACT_FIELD_MESSAGES: Record<ContactFormField, FieldMessages> = {
  full_name: {
    required: 'Full name is required.',
    maxlength: `Full name must be ${CONTACT_FIELD_LIMITS.full_name} characters or fewer.`,
  },
  relationship: {
    required: 'Relationship is required.',
    oneOf: 'Select a valid relationship.',
  },
  email: {
    email: 'Enter a valid email address.',
    maxlength: `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`,
  },
  phone: {
    maxlength: `Phone must be ${CONTACT_FIELD_LIMITS.phone} characters or fewer.`,
  },
  address: {
    maxlength: `Address must be ${CONTACT_FIELD_LIMITS.address} characters or fewer.`,
  },
  notes: {
    maxlength: `Notes must be ${CONTACT_FIELD_LIMITS.notes} characters or fewer.`,
  },
};

export function getContactFieldError(
  field: ContactFormField,
  control: AbstractControl,
): string | null {
  return getFieldError(control, CONTACT_FIELD_MESSAGES[field]);
}

export { invalidFieldClass } from './form-errors';
