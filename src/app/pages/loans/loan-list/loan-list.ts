import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Loan } from '../../../models/loan';
import { LoanService } from '../../../services/loan';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-loan-list',
  imports: [RouterLink],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.css',
})
export class LoanList implements OnInit {
  private readonly loanService = inject(LoanService);

  protected readonly loans = signal<Loan[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadLoans();
  }

  protected async loadLoans(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const loans = await this.loanService.listActive();
      this.loans.set(loans);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load your loans.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
