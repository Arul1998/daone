import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-asset-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetail implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly asset = signal<Asset | null>(null);
  protected readonly loading = signal(true);
  protected readonly archiving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showArchiveConfirm = signal(false);
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/assets']);
      return;
    }

    await this.loadAsset(id);
  }

  protected openArchiveConfirm(): void {
    this.showArchiveConfirm.set(true);
  }

  protected closeArchiveConfirm(): void {
    this.showArchiveConfirm.set(false);
  }

  protected async confirmArchive(): Promise<void> {
    const currentAsset = this.asset();

    if (!currentAsset) {
      return;
    }

    this.archiving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.assetService.archive(currentAsset.id);
      this.successMessage.set('Asset archived successfully.');
      await this.router.navigate(['/assets']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not archive this asset.',
      );
      this.closeArchiveConfirm();
    } finally {
      this.archiving.set(false);
    }
  }

  private async loadAsset(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const asset = await this.assetService.getById(id);

      if (!asset || asset.status !== 1) {
        await this.router.navigate(['/assets']);
        return;
      }

      this.asset.set(asset);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this asset.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
