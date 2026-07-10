import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { AssetArchivedList } from './asset-archived-list';

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

describe('AssetArchivedList', () => {
  let assetService: { listArchived: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    assetService = {
      listArchived: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AssetArchivedList],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetService },
      ],
    }).compileComponents();
  });

  it('shows an empty state when no archived assets exist', async () => {
    assetService.listArchived.mockResolvedValue([]);
    const fixture = TestBed.createComponent(AssetArchivedList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No archived assets yet.');
  });

  it('renders archived assets', async () => {
    assetService.listArchived.mockResolvedValue([archivedAsset]);
    const fixture = TestBed.createComponent(AssetArchivedList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Old Car');
    expect(element.textContent).toContain('Archived');
  });
});
