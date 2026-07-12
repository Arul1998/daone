import { AbstractControl } from '@angular/forms';

import { INSURANCE_FIELD_LIMITS } from '../../models/insurance-policy';
import { FieldMessages, getFieldError } from './form-errors';

type InsuranceFormField =
  | 'name'
  | 'policy_type'
  | 'provider'
  | 'policy_number'
  | 'sum_assured'
  | 'premium_amount'
  | 'currency'
  | 'premium_frequency'
  | 'start_date'
  | 'renewal_date'
  | 'nominee_name'
  | 'nominee_contact'
  | 'notes';

const MONETARY_MESSAGES: FieldMessages = {
  monetary: 'Enter a valid amount with up to two decimal places.',
  min: 'Amount cannot be negative.',
  max: `Amount cannot exceed ${INSURANCE_FIELD_LIMITS.monetaryMax}.`,
};

const INSURANCE_FIELD_MESSAGES: Record<InsuranceFormField, FieldMessages> = {
  name: {
    required: 'Name is required.',
    maxlength: `Name must be ${INSURANCE_FIELD_LIMITS.name} characters or fewer.`,
  },
  policy_type: {
    required: 'Policy type is required.',
    oneOf: 'Select a valid policy type.',
  },
  provider: {
    maxlength: `Provider must be ${INSURANCE_FIELD_LIMITS.provider} characters or fewer.`,
  },
  policy_number: {
    maxlength: `Policy number must be ${INSURANCE_FIELD_LIMITS.policy_number} characters or fewer.`,
  },
  sum_assured: MONETARY_MESSAGES,
  premium_amount: MONETARY_MESSAGES,
  currency: {
    required: 'Currency is required.',
    oneOf: 'Select a valid currency.',
  },
  premium_frequency: {
    oneOf: 'Select a valid premium frequency.',
  },
  start_date: {
    futureDate: 'Start date cannot be in the future.',
  },
  renewal_date: {
    dateOrder: 'Renewal date cannot be before the start date.',
  },
  nominee_name: {
    maxlength: `Nominee name must be ${INSURANCE_FIELD_LIMITS.nominee_name} characters or fewer.`,
  },
  nominee_contact: {
    maxlength: `Nominee contact must be ${INSURANCE_FIELD_LIMITS.nominee_contact} characters or fewer.`,
  },
  notes: {
    maxlength: `Notes must be ${INSURANCE_FIELD_LIMITS.notes} characters or fewer.`,
  },
};

export function getInsuranceFieldError(
  field: InsuranceFormField,
  control: AbstractControl,
): string | null {
  return getFieldError(control, INSURANCE_FIELD_MESSAGES[field]);
}

export { invalidFieldClass } from './form-errors';
