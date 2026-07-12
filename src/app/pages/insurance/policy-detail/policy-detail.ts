import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InsurancePolicy } from '../../../models/insurance-policy';
import { InsurancePolicyService } from '../../../services/insurance-policy';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-policy-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './policy-detail.html',
  styleUrl: './policy-detail.css',
})
export class PolicyDetail implements OnInit {
  private readonly policyService = inject(InsurancePolicyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly policy = signal<InsurancePolicy | null>(null);
  protected readonly loading = signal(true);
  protected readonly archiving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showArchiveConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/insurance']);
      return;
    }

    await this.loadPolicy(id);
  }

  protected openArchiveConfirm(): void {
    this.showArchiveConfirm.set(true);
  }

  protected closeArchiveConfirm(): void {
    this.showArchiveConfirm.set(false);
  }

  protected async confirmArchive(): Promise<void> {
    const currentPolicy = this.policy();

    if (!currentPolicy) {
      return;
    }

    this.archiving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.policyService.archive(currentPolicy.id);
      this.successMessage.set('Policy archived successfully.');
      await this.router.navigate(['/insurance']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not archive this policy.',
      );
      this.closeArchiveConfirm();
    } finally {
      this.archiving.set(false);
    }
  }

  private async loadPolicy(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const policy = await this.policyService.getById(id);

      if (!policy || policy.status !== 1) {
        if (policy?.status === 0) {
          await this.router.navigate(['/insurance/archived', policy.id]);
          return;
        }

        await this.router.navigate(['/insurance']);
        return;
      }

      this.policy.set(policy);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this policy.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
