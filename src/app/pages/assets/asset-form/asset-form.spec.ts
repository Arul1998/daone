import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Asset } from '../../../models/asset';
import { AssetService } from '../../../services/asset';
import { AssetForm } from './asset-form';

const sampleAsset: Asset = {
  id: 'asset-1',
  user_id: 'user-1',
  name: 'Family Home',
  category: 'Property',
  description: 'Main residence',
  purchase_value: 250000,
  current_value: 300000,
  currency: 'GBP',
  purchase_date: '2018-05-01',
  ownership_details: null,
  nominee_name: null,
  nominee_contact: null,
  notes: null,
  status: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('AssetForm', () => {
  let component: AssetForm;
  let assetService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    assetService = {
      create: vi.fn().mockResolvedValue(sampleAsset),
      update: vi.fn().mockResolvedValue(sampleAsset),
      getById: vi.fn().mockResolvedValue(sampleAsset),
    };

    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        provideRouter([
          { path: 'assets/new', component: AssetForm },
          { path: 'assets/:id/edit', component: AssetForm },
          { path: 'assets/:id', component: AssetForm },
        ]),
        { provide: AssetService, useValue: assetService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function createComponent(routePath: string): AssetForm {
    router.navigateByUrl(routePath);
    const fixture = TestBed.createComponent(AssetForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return component;
  }

  it('requires name and category in create mode', async () => {
    createComponent('/assets/new');

    await component['onSubmit']();

    expect(component['form'].controls.name.invalid).toBe(true);
    expect(component['form'].controls.category.invalid).toBe(true);
    expect(assetService.create).not.toHaveBeenCalled();
  });

  it('rejects negative monetary values', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: 'Test Asset',
      category: 'Property',
      current_value: '-10',
    });
    component['form'].markAllAsTouched();

    await component['onSubmit']();

    expect(component['form'].controls.current_value.invalid).toBe(true);
    expect(assetService.create).not.toHaveBeenCalled();
  });

  it('rejects excessive monetary values', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: 'Test Asset',
      category: 'Property',
      current_value: '1000000000000',
    });
    component['form'].markAllAsTouched();

    await component['onSubmit']();

    expect(component['form'].controls.current_value.invalid).toBe(true);
    expect(assetService.create).not.toHaveBeenCalled();
  });

  it('rejects future purchase dates', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: 'Test Asset',
      category: 'Property',
      purchase_date: '2999-01-01',
    });
    component['form'].markAllAsTouched();

    await component['onSubmit']();

    expect(component['form'].controls.purchase_date.invalid).toBe(true);
    expect(assetService.create).not.toHaveBeenCalled();
  });

  it('rejects text longer than the configured maximums', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: 'Test Asset',
      category: 'Property',
      notes: 'x'.repeat(5001),
    });
    component['form'].markAllAsTouched();

    await component['onSubmit']();

    expect(component['form'].controls.notes.invalid).toBe(true);
    expect(assetService.create).not.toHaveBeenCalled();
  });

  it('submits a valid form in create mode', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: '  Family Home  ',
      category: 'Property',
      currency: 'INR',
      current_value: '1500000',
    });

    await component['onSubmit']();

    expect(assetService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Family Home',
        category: 'Property',
        currency: 'INR',
        current_value: 1500000,
      }),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/assets', 'asset-1']);
  });

  it('prevents duplicate submissions while saving', async () => {
    createComponent('/assets/new');
    component['form'].patchValue({
      name: 'Family Home',
      category: 'Property',
    });

    let resolveCreate: (value: Asset) => void = () => undefined;
    assetService.create.mockReturnValue(
      new Promise<Asset>((resolve) => {
        resolveCreate = resolve;
      }),
    );

    const firstSubmit = component['onSubmit']();
    const secondSubmit = component['onSubmit']();

    resolveCreate(sampleAsset);
    await firstSubmit;
    await secondSubmit;

    expect(assetService.create).toHaveBeenCalledTimes(1);
  });
});

describe('AssetForm edit mode', () => {
  let component: AssetForm;
  let assetService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    assetService = {
      create: vi.fn().mockResolvedValue(sampleAsset),
      update: vi.fn().mockResolvedValue(sampleAsset),
      getById: vi.fn().mockResolvedValue(sampleAsset),
    };

    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'asset-1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('loads and updates an asset in edit mode', async () => {
    const fixture = TestBed.createComponent(AssetForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['isEditMode']()).toBe(true);
    expect(assetService.getById).toHaveBeenCalledWith('asset-1');

    component['form'].patchValue({ name: 'Updated Home' });
    await component['onSubmit']();

    expect(assetService.update).toHaveBeenCalledWith(
      'asset-1',
      expect.objectContaining({ name: 'Updated Home' }),
    );
  });
});
