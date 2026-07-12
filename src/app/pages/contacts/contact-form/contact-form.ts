import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  CONTACT_FIELD_LIMITS,
  CONTACT_RELATIONSHIPS,
  TrustedContactInput,
} from '../../../models/trusted-contact';
import { TrustedContactService } from '../../../services/trusted-contact';
import {
  getContactFieldError,
  invalidFieldClass,
} from '../../../shared/validators/contact-form.errors';
import {
  emptyToNull,
  oneOf,
  optionalMaxLength,
  trimmedRequired,
} from '../../../shared/validators/asset.validators';

@Component({
  selector: 'app-contact-form',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm implements OnInit {
  private readonly contactService = inject(TrustedContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly relationships = CONTACT_RELATIONSHIPS;
  protected readonly loading = signal(false);
  protected readonly pageLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isEditMode = signal(false);
  protected readonly contactId = signal<string | null>(null);
  protected readonly getContactFieldError = getContactFieldError;
  protected readonly invalidFieldClass = invalidFieldClass;

  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [trimmedRequired(), Validators.maxLength(CONTACT_FIELD_LIMITS.full_name)]],
    relationship: ['', [Validators.required, oneOf(CONTACT_RELATIONSHIPS)]],
    email: ['', [Validators.email, optionalMaxLength(CONTACT_FIELD_LIMITS.email)]],
    phone: ['', [optionalMaxLength(CONTACT_FIELD_LIMITS.phone)]],
    address: ['', [optionalMaxLength(CONTACT_FIELD_LIMITS.address)]],
    notes: ['', [optionalMaxLength(CONTACT_FIELD_LIMITS.notes)]],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.contactId.set(id);
      await this.loadContact(id);
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

    const input = this.toContactInput();

    try {
      if (this.isEditMode() && this.contactId()) {
        await this.contactService.update(this.contactId()!, input);
        this.successMessage.set('Contact updated successfully.');
        await this.router.navigate(['/contacts', this.contactId()]);
        return;
      }

      const contact = await this.contactService.create(input);
      await this.router.navigate(['/contacts', contact.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not save this contact.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async loadContact(id: string): Promise<void> {
    this.pageLoading.set(true);
    this.errorMessage.set('');

    try {
      const contact = await this.contactService.getById(id);

      if (!contact || contact.status !== 1) {
        await this.router.navigate(['/contacts']);
        return;
      }

      this.form.patchValue({
        full_name: contact.full_name,
        relationship: contact.relationship,
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        address: contact.address ?? '',
        notes: contact.notes ?? '',
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this contact.',
      );
    } finally {
      this.pageLoading.set(false);
    }
  }

  private toContactInput(): TrustedContactInput {
    const raw = this.form.getRawValue();

    return {
      full_name: raw.full_name.trim(),
      relationship: raw.relationship,
      email: emptyToNull(raw.email),
      phone: emptyToNull(raw.phone),
      address: emptyToNull(raw.address),
      notes: emptyToNull(raw.notes),
    };
  }
}
