import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-asset-archived-list',
  imports: [RouterLink],
  templateUrl: './asset-archived-list.html',
  styleUrl: './asset-archived-list.css',
})
export class AssetArchivedList implements OnInit {
  private readonly assetService = inject(AssetService);

  protected readonly assets = signal<Asset[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadArchivedAssets();
  }

  protected async loadArchivedAssets(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const assets = await this.assetService.listArchived();
      this.assets.set(assets);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load archived assets.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
