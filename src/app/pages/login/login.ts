import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EnvironmentService } from '../../core/config/environment.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly environment = inject(EnvironmentService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: [
      this.environment.loginPrefill?.email ?? '',
      [Validators.required, Validators.email],
    ],
    password: [
      this.environment.loginPrefill?.password ?? '',
      [Validators.required, Validators.minLength(6)],
    ],
  });

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);

    this.loading.set(false);

    if (error) {
      this.errorMessage.set(error.message);
      return;
    }

    await this.router.navigate(['/dashboard']);
  }
}
