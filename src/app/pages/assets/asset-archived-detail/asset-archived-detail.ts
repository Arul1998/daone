import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-asset-archived-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './asset-archived-detail.html',
  styleUrl: './asset-archived-detail.css',
})
export class AssetArchivedDetail implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly asset = signal<Asset | null>(null);
  protected readonly loading = signal(true);
  protected readonly restoring = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showRestoreConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/assets/archived']);
      return;
    }

    await this.loadAsset(id);
  }

  protected openRestoreConfirm(): void {
    this.showRestoreConfirm.set(true);
  }

  protected closeRestoreConfirm(): void {
    this.showRestoreConfirm.set(false);
  }

  protected async confirmRestore(): Promise<void> {
    const currentAsset = this.asset();

    if (!currentAsset) {
      return;
    }

    this.restoring.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const restored = await this.assetService.restore(currentAsset.id);
      this.successMessage.set('Asset restored successfully.');
      await this.router.navigate(['/assets', restored.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not restore this asset.',
      );
      this.closeRestoreConfirm();
    } finally {
      this.restoring.set(false);
    }
  }

  private async loadAsset(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const asset = await this.assetService.getById(id);

      if (!asset || asset.status !== 0) {
        await this.router.navigate(['/assets/archived']);
        return;
      }

      this.asset.set(asset);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this archived asset.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
