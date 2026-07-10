import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { AssetArchivedDetail } from './asset-archived-detail';

const archivedAsset: Asset = {
  id: 'asset-archived-1',
  user_id: 'user-1',
  name: 'Old Car',
  category: 'Vehicle',
  description: null,
  purchase_value: 12000,
  current_value: 8000,
  currency: 'GBP',
  purchase_date: null,
  ownership_details: null,
  nominee_name: null,
  nominee_contact: null,
  notes: null,
  status: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

const restoredAsset: Asset = {
  ...archivedAsset,
  status: 1,
};

describe('AssetArchivedDetail', () => {
  let assetService: {
    getById: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    assetService = {
      getById: vi.fn().mockResolvedValue(archivedAsset),
      restore: vi.fn().mockResolvedValue(restoredAsset),
    };

    await TestBed.configureTestingModule({
      imports: [AssetArchivedDetail],
      providers: [
        provideRouter([
          { path: 'assets/archived/:id', component: AssetArchivedDetail },
          { path: 'assets/:id', component: AssetArchivedDetail },
        ]),
        { provide: AssetService, useValue: assetService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('shows restore confirmation dialog', async () => {
    await router.navigateByUrl('/assets/archived/asset-archived-1');
    const fixture = TestBed.createComponent(AssetArchivedDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component['openRestoreConfirm']();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Restore this asset?');
    expect(element.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('restores an archived asset successfully', async () => {
    await router.navigateByUrl('/assets/archived/asset-archived-1');
    const fixture = TestBed.createComponent(AssetArchivedDetail);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    component['asset'].set(archivedAsset);
    await component['confirmRestore']();

    expect(assetService.restore).toHaveBeenCalledWith('asset-archived-1');
    expect(router.navigate).toHaveBeenCalledWith(['/assets', 'asset-archived-1']);
  });

  it('shows a restore error message', async () => {
    assetService.restore.mockRejectedValue(new Error('Restore failed'));
    await router.navigateByUrl('/assets/archived/asset-archived-1');
    const fixture = TestBed.createComponent(AssetArchivedDetail);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    component['asset'].set(archivedAsset);
    await component['confirmRestore']();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Restore failed');
  });
});
