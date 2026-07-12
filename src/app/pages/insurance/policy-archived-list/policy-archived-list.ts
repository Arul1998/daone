import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InsurancePolicy } from '../../../models/insurance-policy';
import { InsurancePolicyService } from '../../../services/insurance-policy';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-policy-archived-list',
  imports: [RouterLink],
  templateUrl: './policy-archived-list.html',
  styleUrl: './policy-archived-list.css',
})
export class PolicyArchivedList implements OnInit {
  private readonly policyService = inject(InsurancePolicyService);

  protected readonly policies = signal<InsurancePolicy[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadArchivedPolicies();
  }

  protected async loadArchivedPolicies(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const policies = await this.policyService.listArchived();
      this.policies.set(policies);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load archived insurance policies.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
