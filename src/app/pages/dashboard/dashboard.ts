import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profile } from '../../models/profile';
import { AssetService } from '../../services/asset';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';
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

  protected readonly user = this.auth.user;
  protected readonly profile = signal<Profile | null>(null);
  protected readonly profileError = signal('');
  protected readonly summaryCards = signal<SummaryCard[]>([
    { title: 'Assets', value: '—', note: 'Loading...', link: '/assets' },
    { title: 'Loans', value: '—', note: 'Coming soon' },
    { title: 'Insurance', value: '—', note: 'Coming soon' },
    { title: 'Contacts', value: '—', note: 'Coming soon' },
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

    await this.loadAssetSummary();
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

  private updateSummaryCard(title: string, updates: Partial<SummaryCard>): void {
    this.summaryCards.update((cards) =>
      cards.map((card) => (card.title === title ? { ...card, ...updates } : card)),
    );
  }
}
