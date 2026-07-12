import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InsurancePolicy, InsurancePolicyInput } from '../models/insurance-policy';
import { AuthService } from './auth';
import { InsurancePolicyService } from './insurance-policy';
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

const sampleInput: InsurancePolicyInput = {
  name: 'Family Term Cover',
  policy_type: 'Term Life',
  provider: 'Aviva',
  policy_number: 'AV-123456',
  sum_assured: 500000,
  premium_amount: 45.5,
  currency: 'GBP',
  premium_frequency: 'Monthly',
  start_date: '2022-01-01',
  renewal_date: '2027-01-01',
  nominee_name: null,
  nominee_contact: null,
  notes: null,
};

const activePolicy: InsurancePolicy = {
  id: 'policy-1',
  user_id: 'user-1',
  ...sampleInput,
  status: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const archivedPolicy: InsurancePolicy = {
  ...activePolicy,
  id: 'policy-2',
  status: 0,
};

describe('InsurancePolicyService', () => {
  let service: InsurancePolicyService;
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
        InsurancePolicyService,
        { provide: AuthService, useValue: authService },
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    });

    service = TestBed.inject(InsurancePolicyService);
  });

  it('listActive returns only active policies', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [activePolicy], error: null }));

    const policies = await service.listActive();

    expect(policies).toEqual([activePolicy]);
    expect(fromMock).toHaveBeenCalledWith('insurance_policies');
  });

  it('listArchived returns archived policies', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [archivedPolicy], error: null }));

    const policies = await service.listArchived();

    expect(policies).toEqual([archivedPolicy]);
  });

  it('create adds the authenticated user ID and status 1', async () => {
    const insertBuilder = createQueryBuilder({ data: activePolicy, error: null });
    fromMock.mockReturnValue(insertBuilder);

    const created = await service.create(sampleInput);

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      ...sampleInput,
      user_id: 'user-1',
      status: 1,
    });
    expect(created).toEqual(activePolicy);
  });

  it('update targets the correct user and policy', async () => {
    const updateBuilder = createQueryBuilder({ data: activePolicy, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const updated = await service.update('policy-1', sampleInput);

    expect(updateBuilder.update).toHaveBeenCalledWith(sampleInput);
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'policy-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(updated).toEqual(activePolicy);
  });

  it('archive changes status to 0', async () => {
    const updateBuilder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(updateBuilder);

    await service.archive('policy-1');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 0 });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'policy-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('restore changes status to 1', async () => {
    const updateBuilder = createQueryBuilder({ data: activePolicy, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const restored = await service.restore('policy-2');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 1 });
    expect(restored.status).toBe(1);
  });

  it('summarises sum assured per currency', async () => {
    const secondPolicy: InsurancePolicy = {
      ...activePolicy,
      id: 'policy-3',
      currency: 'INR',
      sum_assured: 2000000,
    };
    fromMock.mockReturnValue(
      createQueryBuilder({ data: [activePolicy, secondPolicy], error: null }),
    );

    const summary = await service.getActiveSummary();

    expect(summary.count).toBe(2);
    expect(summary.sumAssuredByCurrency).toEqual({ GBP: 500000, INR: 2000000 });
  });

  it('fails unauthenticated operations', async () => {
    authService.user.mockReturnValue(null);

    await expect(service.listActive()).rejects.toThrow(
      'You must be signed in to manage insurance policies.',
    );
  });

  it('produces readable messages for Supabase errors', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: 'permission denied' } }),
    );

    await expect(service.listActive()).rejects.toThrow('permission denied');
  });
});
