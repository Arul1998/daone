import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Loan } from '../../../models/loan';
import { LoanService } from '../../../services/loan';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-loan-archived-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './loan-archived-detail.html',
  styleUrl: './loan-archived-detail.css',
})
export class LoanArchivedDetail implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loan = signal<Loan | null>(null);
  protected readonly loading = signal(true);
  protected readonly restoring = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showRestoreConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/loans/archived']);
      return;
    }

    await this.loadLoan(id);
  }

  protected openRestoreConfirm(): void {
    this.showRestoreConfirm.set(true);
  }

  protected closeRestoreConfirm(): void {
    this.showRestoreConfirm.set(false);
  }

  protected async confirmRestore(): Promise<void> {
    const currentLoan = this.loan();

    if (!currentLoan) {
      return;
    }

    this.restoring.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const restored = await this.loanService.restore(currentLoan.id);
      this.successMessage.set('Loan restored successfully.');
      await this.router.navigate(['/loans', restored.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not restore this loan.',
      );
      this.closeRestoreConfirm();
    } finally {
      this.restoring.set(false);
    }
  }

  private async loadLoan(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const loan = await this.loanService.getById(id);

      if (!loan || loan.status !== 0) {
        await this.router.navigate(['/loans/archived']);
        return;
      }

      this.loan.set(loan);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this archived loan.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
