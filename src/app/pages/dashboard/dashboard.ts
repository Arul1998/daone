import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profile } from '../../models/profile';
import { AssetService } from '../../services/asset';
import { AuthService } from '../../services/auth';
import { InsurancePolicyService } from '../../services/insurance-policy';
import { LoanService } from '../../services/loan';
import { ProfileService } from '../../services/profile';
import { TrustedContactService } from '../../services/trusted-contact';
import { formatCurrencyTotals } from '../../shared/utils/currency';

interface SummaryCard {
  title: string;
  value: string;
  note: string;
  link?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly assetService = inject(AssetService);
  private readonly loanService = inject(LoanService);
  private readonly policyService = inject(InsurancePolicyService);
  private readonly contactService = inject(TrustedContactService);

  protected readonly user = this.auth.user;
  protected readonly profile = signal<Profile | null>(null);
  protected readonly profileError = signal('');
  protected readonly summaryCards = signal<SummaryCard[]>([
    { title: 'Assets', value: '—', note: 'Loading...', link: '/assets' },
    { title: 'Loans', value: '—', note: 'Loading...', link: '/loans' },
    { title: 'Insurance', value: '—', note: 'Loading...', link: '/insurance' },
    { title: 'Contacts', value: '—', note: 'Loading...', link: '/contacts' },
  ]);

  async ngOnInit(): Promise<void> {
    await this.auth.init();

    try {
      const profile = await this.profileService.getMyProfile();
      this.profile.set(profile);
    } catch (error) {
      this.profileError.set(
        error instanceof Error ? error.message : 'Could not load your profile. Please try again later.',
      );
    }

    await Promise.all([
      this.loadAssetSummary(),
      this.loadLoanSummary(),
      this.loadInsuranceSummary(),
      this.loadContactSummary(),
    ]);
  }

  private async loadAssetSummary(): Promise<void> {
    try {
      const summary = await this.assetService.getActiveSummary();
      const valueLabel = formatCurrencyTotals(summary.totalsByCurrency);
      const note =
        summary.count === 0
          ? 'No current value recorded'
          : valueLabel === '—'
            ? `${summary.count} active asset${summary.count === 1 ? '' : 's'}`
            : `${valueLabel} total value`;

      this.updateSummaryCard('Assets', {
        value: summary.count.toString(),
        note,
        link: '/assets',
      });
    } catch {
      this.updateSummaryCard('Assets', {
        value: '—',
        note: 'Could not load assets',
        link: '/assets',
      });
    }
  }

  private async loadLoanSummary(): Promise<void> {
    try {
      const summary = await this.loanService.getActiveSummary();
      const valueLabel = formatCurrencyTotals(summary.outstandingByCurrency);
      const note =
        summary.count === 0
          ? 'No active loans'
          : valueLabel === '—'
            ? `${summary.count} active loan${summary.count === 1 ? '' : 's'}`
            : `${valueLabel} outstanding`;

      this.updateSummaryCard('Loans', {
        value: summary.count.toString(),
        note,
        link: '/loans',
      });
    } catch {
      this.updateSummaryCard('Loans', {
        value: '—',
        note: 'Could not load loans',
        link: '/loans',
      });
    }
  }

  private async loadInsuranceSummary(): Promise<void> {
    try {
      const summary = await this.policyService.getActiveSummary();
      const valueLabel = formatCurrencyTotals(summary.sumAssuredByCurrency);
      const note =
        summary.count === 0
          ? 'No active policies'
          : valueLabel === '—'
            ? `${summary.count} active polic${summary.count === 1 ? 'y' : 'ies'}`
            : `${valueLabel} sum assured`;

      this.updateSummaryCard('Insurance', {
        value: summary.count.toString(),
        note,
        link: '/insurance',
      });
    } catch {
      this.updateSummaryCard('Insurance', {
        value: '—',
        note: 'Could not load insurance',
        link: '/insurance',
      });
    }
  }

  private async loadContactSummary(): Promise<void> {
    try {
      const summary = await this.contactService.getActiveSummary();
      const note =
        summary.count === 0
          ? 'No trusted contacts yet'
          : `${summary.count} trusted contact${summary.count === 1 ? '' : 's'}`;

      this.updateSummaryCard('Contacts', {
        value: summary.count.toString(),
        note,
        link: '/contacts',
      });
    } catch {
      this.updateSummaryCard('Contacts', {
        value: '—',
        note: 'Could not load contacts',
        link: '/contacts',
      });
    }
  }

  private updateSummaryCard(title: string, updates: Partial<SummaryCard>): void {
    this.summaryCards.update((cards) =>
      cards.map((card) => (card.title === title ? { ...card, ...updates } : card)),
    );
  }
}
