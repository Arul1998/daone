import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ASSET_CURRENCIES } from '../../../models/asset';
import {
  INSURANCE_FIELD_LIMITS,
  INSURANCE_POLICY_TYPES,
  INSURANCE_PREMIUM_FREQUENCIES,
  InsurancePolicyInput,
} from '../../../models/insurance-policy';
import { InsurancePolicyService } from '../../../services/insurance-policy';
import { dateOnOrAfter } from '../../../shared/validators/common.validators';
import {
  getInsuranceFieldError,
  invalidFieldClass,
} from '../../../shared/validators/insurance-form.errors';
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
  selector: 'app-policy-form',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.css',
})
export class PolicyForm implements OnInit {
  private readonly policyService = inject(InsurancePolicyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly policyTypes = INSURANCE_POLICY_TYPES;
  protected readonly premiumFrequencies = INSURANCE_PREMIUM_FREQUENCIES;
  protected readonly currencies = ASSET_CURRENCIES;
  protected readonly loading = signal(false);
  protected readonly pageLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isEditMode = signal(false);
  protected readonly policyId = signal<string | null>(null);
  protected readonly getInsuranceFieldError = getInsuranceFieldError;
  protected readonly invalidFieldClass = invalidFieldClass;

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      name: ['', [trimmedRequired(), Validators.maxLength(INSURANCE_FIELD_LIMITS.name)]],
      policy_type: ['', [Validators.required, oneOf(INSURANCE_POLICY_TYPES)]],
      provider: ['', [optionalMaxLength(INSURANCE_FIELD_LIMITS.provider)]],
      policy_number: ['', [optionalMaxLength(INSURANCE_FIELD_LIMITS.policy_number)]],
      sum_assured: ['', [optionalMonetaryValue()]],
      premium_amount: ['', [optionalMonetaryValue()]],
      currency: ['GBP', [Validators.required, oneOf(ASSET_CURRENCIES)]],
      premium_frequency: ['', [oneOf(INSURANCE_PREMIUM_FREQUENCIES)]],
      start_date: ['', [notFutureDate()]],
      renewal_date: [''],
      nominee_name: ['', [optionalMaxLength(INSURANCE_FIELD_LIMITS.nominee_name)]],
      nominee_contact: ['', [optionalMaxLength(INSURANCE_FIELD_LIMITS.nominee_contact)]],
      notes: ['', [optionalMaxLength(INSURANCE_FIELD_LIMITS.notes)]],
    },
    { validators: [dateOnOrAfter('start_date', 'renewal_date')] },
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.policyId.set(id);
      await this.loadPolicy(id);
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

    const input = this.toPolicyInput();

    try {
      if (this.isEditMode() && this.policyId()) {
        await this.policyService.update(this.policyId()!, input);
        this.successMessage.set('Policy updated successfully.');
        await this.router.navigate(['/insurance', this.policyId()]);
        return;
      }

      const policy = await this.policyService.create(input);
      await this.router.navigate(['/insurance', policy.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not save this policy.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPolicy(id: string): Promise<void> {
    this.pageLoading.set(true);
    this.errorMessage.set('');

    try {
      const policy = await this.policyService.getById(id);

      if (!policy || policy.status !== 1) {
        await this.router.navigate(['/insurance']);
        return;
      }

      this.form.patchValue({
        name: policy.name,
        policy_type: policy.policy_type,
        provider: policy.provider ?? '',
        policy_number: policy.policy_number ?? '',
        sum_assured: policy.sum_assured?.toString() ?? '',
        premium_amount: policy.premium_amount?.toString() ?? '',
        currency: policy.currency,
        premium_frequency: policy.premium_frequency ?? '',
        start_date: policy.start_date ?? '',
        renewal_date: policy.renewal_date ?? '',
        nominee_name: policy.nominee_name ?? '',
        nominee_contact: policy.nominee_contact ?? '',
        notes: policy.notes ?? '',
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this policy.',
      );
    } finally {
      this.pageLoading.set(false);
    }
  }

  private toPolicyInput(): InsurancePolicyInput {
    const raw = this.form.getRawValue();

    return {
      name: raw.name.trim(),
      policy_type: raw.policy_type,
      provider: emptyToNull(raw.provider),
      policy_number: emptyToNull(raw.policy_number),
      sum_assured: parseValidatedMonetaryValue(raw.sum_assured),
      premium_amount: parseValidatedMonetaryValue(raw.premium_amount),
      currency: raw.currency,
      premium_frequency: raw.premium_frequency || null,
      start_date: raw.start_date || null,
      renewal_date: raw.renewal_date || null,
      nominee_name: emptyToNull(raw.nominee_name),
      nominee_contact: emptyToNull(raw.nominee_contact),
      notes: emptyToNull(raw.notes),
    };
  }
}
