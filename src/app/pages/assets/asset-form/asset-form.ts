import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  ASSET_CATEGORIES,
  ASSET_CURRENCIES,
  ASSET_FIELD_LIMITS,
  AssetInput,
} from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import {
  getAssetFieldError,
  invalidFieldClass,
} from '../../../shared/validators/asset-form.errors';
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
  selector: 'app-asset-form',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
})
export class AssetForm implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categories = ASSET_CATEGORIES;
  protected readonly currencies = ASSET_CURRENCIES;
  protected readonly loading = signal(false);
  protected readonly pageLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isEditMode = signal(false);
  protected readonly assetId = signal<string | null>(null);
  protected readonly getAssetFieldError = getAssetFieldError;
  protected readonly invalidFieldClass = invalidFieldClass;

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [trimmedRequired(), Validators.maxLength(ASSET_FIELD_LIMITS.name)]],
    category: ['', [Validators.required, oneOf(ASSET_CATEGORIES)]],
    description: ['', [optionalMaxLength(ASSET_FIELD_LIMITS.description)]],
    purchase_value: ['', [optionalMonetaryValue()]],
    current_value: ['', [optionalMonetaryValue()]],
    currency: ['GBP', [Validators.required, oneOf(ASSET_CURRENCIES)]],
    purchase_date: ['', [notFutureDate()]],
    ownership_details: ['', [optionalMaxLength(ASSET_FIELD_LIMITS.ownership_details)]],
    nominee_name: ['', [optionalMaxLength(ASSET_FIELD_LIMITS.nominee_name)]],
    nominee_contact: ['', [optionalMaxLength(ASSET_FIELD_LIMITS.nominee_contact)]],
    notes: ['', [optionalMaxLength(ASSET_FIELD_LIMITS.notes)]],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.assetId.set(id);
      await this.loadAsset(id);
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

    const input = this.toAssetInput();

    try {
      if (this.isEditMode() && this.assetId()) {
        await this.assetService.update(this.assetId()!, input);
        this.successMessage.set('Asset updated successfully.');
        await this.router.navigate(['/assets', this.assetId()]);
        return;
      }

      const asset = await this.assetService.create(input);
      await this.router.navigate(['/assets', asset.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not save this asset.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAsset(id: string): Promise<void> {
    this.pageLoading.set(true);
    this.errorMessage.set('');

    try {
      const asset = await this.assetService.getById(id);

      if (!asset || asset.status !== 1) {
        await this.router.navigate(['/assets']);
        return;
      }

      this.form.patchValue({
        name: asset.name,
        category: asset.category,
        description: asset.description ?? '',
        purchase_value: asset.purchase_value?.toString() ?? '',
        current_value: asset.current_value?.toString() ?? '',
        currency: asset.currency,
        purchase_date: asset.purchase_date ?? '',
        ownership_details: asset.ownership_details ?? '',
        nominee_name: asset.nominee_name ?? '',
        nominee_contact: asset.nominee_contact ?? '',
        notes: asset.notes ?? '',
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this asset.',
      );
    } finally {
      this.pageLoading.set(false);
    }
  }

  private toAssetInput(): AssetInput {
    const raw = this.form.getRawValue();

    return {
      name: raw.name.trim(),
      category: raw.category,
      description: emptyToNull(raw.description),
      purchase_value: parseValidatedMonetaryValue(raw.purchase_value),
      current_value: parseValidatedMonetaryValue(raw.current_value),
      currency: raw.currency,
      purchase_date: raw.purchase_date || null,
      ownership_details: emptyToNull(raw.ownership_details),
      nominee_name: emptyToNull(raw.nominee_name),
      nominee_contact: emptyToNull(raw.nominee_contact),
      notes: emptyToNull(raw.notes),
    };
  }
}
