import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InsurancePolicy } from '../../../models/insurance-policy';
import { InsurancePolicyService } from '../../../services/insurance-policy';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-policy-list',
  imports: [RouterLink],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css',
})
export class PolicyList implements OnInit {
  private readonly policyService = inject(InsurancePolicyService);

  protected readonly policies = signal<InsurancePolicy[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadPolicies();
  }

  protected async loadPolicies(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const policies = await this.policyService.listActive();
      this.policies.set(policies);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load your insurance policies.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
