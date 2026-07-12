import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ASSET_CURRENCIES } from '../../../models/asset';
import { LOAN_FIELD_LIMITS, LOAN_TYPES, LoanInput } from '../../../models/loan';
import { LoanService } from '../../../services/loan';
import { dateOnOrAfter, optionalPercentage } from '../../../shared/validators/common.validators';
import {
  getLoanFieldError,
  invalidFieldClass,
} from '../../../shared/validators/loan-form.errors';
import {
  emptyToNull,
  notFutureDate,
  oneOf,
  optionalMaxLength,
  optionalMonetaryValue,
  parseValidatedMonetaryValue,
  trimmedRequired,
} from '../../../shared/validators/asset.validators';

@Component({
  selector: 'app-loan-form',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './loan-form.html',
  styleUrl: './loan-form.css',
})
export class LoanForm implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loanTypes = LOAN_TYPES;
  protected readonly currencies = ASSET_CURRENCIES;
  protected readonly loading = signal(false);
  protected readonly pageLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isEditMode = signal(false);
  protected readonly loanId = signal<string | null>(null);
  protected readonly getLoanFieldError = getLoanFieldError;
  protected readonly invalidFieldClass = invalidFieldClass;

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      name: ['', [trimmedRequired(), Validators.maxLength(LOAN_FIELD_LIMITS.name)]],
      loan_type: ['', [Validators.required, oneOf(LOAN_TYPES)]],
      lender: ['', [optionalMaxLength(LOAN_FIELD_LIMITS.lender)]],
      principal_amount: ['', [optionalMonetaryValue()]],
      outstanding_amount: ['', [optionalMonetaryValue()]],
      currency: ['GBP', [Validators.required, oneOf(ASSET_CURRENCIES)]],
      interest_rate: ['', [optionalPercentage()]],
      start_date: ['', [notFutureDate()]],
      end_date: [''],
      account_reference: ['', [optionalMaxLength(LOAN_FIELD_LIMITS.account_reference)]],
      notes: ['', [optionalMaxLength(LOAN_FIELD_LIMITS.notes)]],
    },
    { validators: [dateOnOrAfter('start_date', 'end_date')] },
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.loanId.set(id);
      await this.loadLoan(id);
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const input = this.toLoanInput();

    try {
      if (this.isEditMode() && this.loanId()) {
        await this.loanService.update(this.loanId()!, input);
        this.successMessage.set('Loan updated successfully.');
        await this.router.navigate(['/loans', this.loanId()]);
        return;
      }

      const loan = await this.loanService.create(input);
      await this.router.navigate(['/loans', loan.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not save this loan.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async loadLoan(id: string): Promise<void> {
    this.pageLoading.set(true);
    this.errorMessage.set('');

    try {
      const loan = await this.loanService.getById(id);

      if (!loan || loan.status !== 1) {
        await this.router.navigate(['/loans']);
        return;
      }

      this.form.patchValue({
        name: loan.name,
        loan_type: loan.loan_type,
        lender: loan.lender ?? '',
        principal_amount: loan.principal_amount?.toString() ?? '',
        outstanding_amount: loan.outstanding_amount?.toString() ?? '',
        currency: loan.currency,
        interest_rate: loan.interest_rate?.toString() ?? '',
        start_date: loan.start_date ?? '',
        end_date: loan.end_date ?? '',
        account_reference: loan.account_reference ?? '',
        notes: loan.notes ?? '',
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this loan.',
      );
    } finally {
      this.pageLoading.set(false);
    }
  }

  private toLoanInput(): LoanInput {
    const raw = this.form.getRawValue();

    return {
      name: raw.name.trim(),
      loan_type: raw.loan_type,
      lender: emptyToNull(raw.lender),
      principal_amount: parseValidatedMonetaryValue(raw.principal_amount),
      outstanding_amount: parseValidatedMonetaryValue(raw.outstanding_amount),
      currency: raw.currency,
      interest_rate: parseValidatedMonetaryValue(raw.interest_rate),
      start_date: raw.start_date || null,
      end_date: raw.end_date || null,
      account_reference: emptyToNull(raw.account_reference),
      notes: emptyToNull(raw.notes),
    };
  }
}
