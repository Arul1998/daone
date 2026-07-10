import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { formatCurrency } from '../../../shared/utils/currency';

@Component({
  selector: 'app-asset-list',
  imports: [RouterLink],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css',
})
export class AssetList implements OnInit {
  private readonly assetService = inject(AssetService);

  protected readonly assets = signal<Asset[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly formatCurrency = formatCurrency;

  async ngOnInit(): Promise<void> {
    await this.loadAssets();
  }

  protected async loadAssets(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const assets = await this.assetService.listActive();
      this.assets.set(assets);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load your assets.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
