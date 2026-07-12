import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InsurancePolicy } from '../../../models/insurance-policy';
import { InsurancePolicyService } from '../../../services/insurance-policy';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-policy-archived-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './policy-archived-detail.html',
  styleUrl: './policy-archived-detail.css',
})
export class PolicyArchivedDetail implements OnInit {
  private readonly policyService = inject(InsurancePolicyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly policy = signal<InsurancePolicy | null>(null);
  protected readonly loading = signal(true);
  protected readonly restoring = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showRestoreConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/insurance/archived']);
      return;
    }

    await this.loadPolicy(id);
  }

  protected openRestoreConfirm(): void {
    this.showRestoreConfirm.set(true);
  }

  protected closeRestoreConfirm(): void {
    this.showRestoreConfirm.set(false);
  }

  protected async confirmRestore(): Promise<void> {
    const currentPolicy = this.policy();

    if (!currentPolicy) {
      return;
    }

    this.restoring.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const restored = await this.policyService.restore(currentPolicy.id);
      this.successMessage.set('Policy restored successfully.');
      await this.router.navigate(['/insurance', restored.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not restore this policy.',
      );
      this.closeRestoreConfirm();
    } finally {
      this.restoring.set(false);
    }
  }

  private async loadPolicy(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const policy = await this.policyService.getById(id);

      if (!policy || policy.status !== 0) {
        await this.router.navigate(['/insurance/archived']);
        return;
      }

      this.policy.set(policy);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this archived policy.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
