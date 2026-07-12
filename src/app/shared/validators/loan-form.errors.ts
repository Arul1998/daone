import { AbstractControl } from '@angular/forms';

import { LOAN_FIELD_LIMITS } from '../../models/loan';
import { FieldMessages, getFieldError } from './form-errors';

type LoanFormField =
  | 'name'
  | 'loan_type'
  | 'lender'
  | 'principal_amount'
  | 'outstanding_amount'
  | 'currency'
  | 'interest_rate'
  | 'start_date'
  | 'end_date'
  | 'account_reference'
  | 'notes';

const MONETARY_MESSAGES: FieldMessages = {
  monetary: 'Enter a valid amount with up to two decimal places.',
  min: 'Amount cannot be negative.',
  max: `Amount cannot exceed ${LOAN_FIELD_LIMITS.monetaryMax}.`,
};

const LOAN_FIELD_MESSAGES: Record<LoanFormField, FieldMessages> = {
  name: {
    required: 'Name is required.',
    maxlength: `Name must be ${LOAN_FIELD_LIMITS.name} characters or fewer.`,
  },
  loan_type: {
    required: 'Loan type is required.',
    oneOf: 'Select a valid loan type.',
  },
  lender: {
    maxlength: `Lender must be ${LOAN_FIELD_LIMITS.lender} characters or fewer.`,
  },
  principal_amount: MONETARY_MESSAGES,
  outstanding_amount: MONETARY_MESSAGES,
  currency: {
    required: 'Currency is required.',
    oneOf: 'Select a valid currency.',
  },
  interest_rate: {
    percentage: 'Enter a valid rate with up to two decimal places.',
    max: 'Interest rate cannot exceed 100.',
  },
  start_date: {
    futureDate: 'Start date cannot be in the future.',
  },
  end_date: {
    dateOrder: 'End date cannot be before the start date.',
  },
  account_reference: {
    maxlength: `Account reference must be ${LOAN_FIELD_LIMITS.account_reference} characters or fewer.`,
  },
  notes: {
    maxlength: `Notes must be ${LOAN_FIELD_LIMITS.notes} characters or fewer.`,
  },
};

export function getLoanFieldError(field: LoanFormField, control: AbstractControl): string | null {
  return getFieldError(control, LOAN_FIELD_MESSAGES[field]);
}

export { invalidFieldClass } from './form-errors';
