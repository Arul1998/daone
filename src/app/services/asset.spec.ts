import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Asset, AssetInput } from '../models/asset';
import { AssetService } from './asset';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

interface QueryResult<T> {
  data: T;
  error: { message: string } | null;
}

function createQueryBuilder<T>(result: QueryResult<T>) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult<T>) => void) => Promise.resolve(result).then(resolve),
  };

  return builder;
}

const sampleInput: AssetInput = {
  name: 'Family Home',
  category: 'Property',
  description: null,
  purchase_value: 250000,
  current_value: 300000,
  currency: 'GBP',
  purchase_date: '2018-05-01',
  ownership_details: null,
  nominee_name: null,
  nominee_contact: null,
  notes: null,
};

const activeAsset: Asset = {
  id: 'asset-1',
  user_id: 'user-1',
  ...sampleInput,
  status: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const archivedAsset: Asset = {
  ...activeAsset,
  id: 'asset-2',
  status: 0,
};

describe('AssetService', () => {
  let service: AssetService;
  let fromMock: ReturnType<typeof vi.fn>;
  let authService: { init: ReturnType<typeof vi.fn>; user: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    fromMock = vi.fn();
    authService = {
      init: vi.fn().mockResolvedValue(undefined),
      user: vi.fn().mockReturnValue({ id: 'user-1' }),
    };

    TestBed.configureTestingModule({
      providers: [
        AssetService,
        { provide: AuthService, useValue: authService },
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    });

    service = TestBed.inject(AssetService);
  });

  it('listActive returns only active assets', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: [activeAsset], error: null }),
    );

    const assets = await service.listActive();

    expect(assets).toEqual([activeAsset]);
    expect(fromMock).toHaveBeenCalledWith('assets');
  });

  it('listArchived returns archived assets', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: [archivedAsset], error: null }),
    );

    const assets = await service.listArchived();

    expect(assets).toEqual([archivedAsset]);
  });

  it('create adds the authenticated user ID and status 1', async () => {
    const insertBuilder = createQueryBuilder({ data: activeAsset, error: null });
    fromMock.mockReturnValue(insertBuilder);

    const created = await service.create(sampleInput);

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      ...sampleInput,
      user_id: 'user-1',
      status: 1,
    });
    expect(created).toEqual(activeAsset);
  });

  it('update targets the correct user and asset', async () => {
    const updateBuilder = createQueryBuilder({ data: activeAsset, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const updated = await service.update('asset-1', sampleInput);

    expect(updateBuilder.update).toHaveBeenCalledWith(sampleInput);
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'asset-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(updated).toEqual(activeAsset);
  });

  it('archive changes status to 0', async () => {
    const updateBuilder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(updateBuilder);

    await service.archive('asset-1');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 0 });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'asset-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('restore changes status to 1', async () => {
    const updateBuilder = createQueryBuilder({ data: activeAsset, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const restored = await service.restore('asset-2');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 1 });
    expect(restored.status).toBe(1);
  });

  it('fails unauthenticated operations', async () => {
    authService.user.mockReturnValue(null);

    await expect(service.listActive()).rejects.toThrow(
      'You must be signed in to manage assets.',
    );
  });

  it('produces readable messages for Supabase errors', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: 'permission denied' } }),
    );

    await expect(service.listActive()).rejects.toThrow('permission denied');
  });
});
