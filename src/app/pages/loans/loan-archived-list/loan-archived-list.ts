import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Loan } from '../../../models/loan';
import { LoanService } from '../../../services/loan';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-loan-archived-list',
  imports: [RouterLink],
  templateUrl: './loan-archived-list.html',
  styleUrl: './loan-archived-list.css',
})
export class LoanArchivedList implements OnInit {
  private readonly loanService = inject(LoanService);

  protected readonly loans = signal<Loan[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadArchivedLoans();
  }

  protected async loadArchivedLoans(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const loans = await this.loanService.listArchived();
      this.loans.set(loans);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load archived loans.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
