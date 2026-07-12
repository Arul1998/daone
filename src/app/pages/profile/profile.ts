import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Profile as ProfileModel } from '../../models/profile';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { invalidFieldClass } from '../../shared/validators/form-errors';
import { emptyToNull } from '../../shared/validators/asset.validators';

export const PROFILE_FULL_NAME_MAX_LENGTH = 120;

@Component({
  selector: 'app-profile',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly fullNameMaxLength = PROFILE_FULL_NAME_MAX_LENGTH;
  protected readonly profile = signal<ProfileModel | null>(null);
  protected readonly pageLoading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly invalidFieldClass = invalidFieldClass;

  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [Validators.maxLength(PROFILE_FULL_NAME_MAX_LENGTH)]],
  });

  async ngOnInit(): Promise<void> {
    await this.auth.init();
    await this.loadProfile();
  }

  protected async onSubmit(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const fullName = emptyToNull(this.form.getRawValue().full_name);
      const updated = await this.profileService.updateMyProfile(fullName);
      this.profile.set(updated);
      this.form.patchValue({ full_name: updated.full_name ?? '' });
      this.successMessage.set('Profile updated successfully.');
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not update your profile.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  private async loadProfile(): Promise<void> {
    this.pageLoading.set(true);
    this.errorMessage.set('');

    try {
      const profile = await this.profileService.getMyProfile();
      this.profile.set(profile);
      this.form.patchValue({ full_name: profile?.full_name ?? '' });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load your profile.',
      );
    } finally {
      this.pageLoading.set(false);
    }
  }
}
