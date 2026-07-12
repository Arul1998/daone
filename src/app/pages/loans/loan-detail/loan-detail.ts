import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Loan } from '../../../models/loan';
import { LoanService } from '../../../services/loan';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-loan-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.css',
})
export class LoanDetail implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loan = signal<Loan | null>(null);
  protected readonly loading = signal(true);
  protected readonly archiving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showArchiveConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/loans']);
      return;
    }

    await this.loadLoan(id);
  }

  protected openArchiveConfirm(): void {
    this.showArchiveConfirm.set(true);
  }

  protected closeArchiveConfirm(): void {
    this.showArchiveConfirm.set(false);
  }

  protected async confirmArchive(): Promise<void> {
    const currentLoan = this.loan();

    if (!currentLoan) {
      return;
    }

    this.archiving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.loanService.archive(currentLoan.id);
      this.successMessage.set('Loan archived successfully.');
      await this.router.navigate(['/loans']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not archive this loan.',
      );
      this.closeArchiveConfirm();
    } finally {
      this.archiving.set(false);
    }
  }

  private async loadLoan(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const loan = await this.loanService.getById(id);

      if (!loan || loan.status !== 1) {
        if (loan?.status === 0) {
          await this.router.navigate(['/loans/archived', loan.id]);
          return;
        }

        await this.router.navigate(['/loans']);
        return;
      }

      this.loan.set(loan);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this loan.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
