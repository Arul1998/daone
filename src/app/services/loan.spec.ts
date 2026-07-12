import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Loan, LoanInput } from '../models/loan';
import { AuthService } from './auth';
import { LoanService } from './loan';
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

const sampleInput: LoanInput = {
  name: 'Home Mortgage',
  loan_type: 'Home Loan',
  lender: 'Halifax',
  principal_amount: 250000,
  outstanding_amount: 180000,
  currency: 'GBP',
  interest_rate: 4.25,
  start_date: '2020-03-01',
  end_date: '2045-03-01',
  account_reference: null,
  notes: null,
};

const activeLoan: Loan = {
  id: 'loan-1',
  user_id: 'user-1',
  ...sampleInput,
  status: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const archivedLoan: Loan = {
  ...activeLoan,
  id: 'loan-2',
  status: 0,
};

describe('LoanService', () => {
  let service: LoanService;
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
        LoanService,
        { provide: AuthService, useValue: authService },
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    });

    service = TestBed.inject(LoanService);
  });

  it('listActive returns only active loans', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [activeLoan], error: null }));

    const loans = await service.listActive();

    expect(loans).toEqual([activeLoan]);
    expect(fromMock).toHaveBeenCalledWith('loans');
  });

  it('listArchived returns archived loans', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [archivedLoan], error: null }));

    const loans = await service.listArchived();

    expect(loans).toEqual([archivedLoan]);
  });

  it('create adds the authenticated user ID and status 1', async () => {
    const insertBuilder = createQueryBuilder({ data: activeLoan, error: null });
    fromMock.mockReturnValue(insertBuilder);

    const created = await service.create(sampleInput);

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      ...sampleInput,
      user_id: 'user-1',
      status: 1,
    });
    expect(created).toEqual(activeLoan);
  });

  it('update targets the correct user and loan', async () => {
    const updateBuilder = createQueryBuilder({ data: activeLoan, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const updated = await service.update('loan-1', sampleInput);

    expect(updateBuilder.update).toHaveBeenCalledWith(sampleInput);
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'loan-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(updated).toEqual(activeLoan);
  });

  it('archive changes status to 0', async () => {
    const updateBuilder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(updateBuilder);

    await service.archive('loan-1');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 0 });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'loan-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('restore changes status to 1', async () => {
    const updateBuilder = createQueryBuilder({ data: activeLoan, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const restored = await service.restore('loan-2');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 1 });
    expect(restored.status).toBe(1);
  });

  it('summarises outstanding amounts per currency', async () => {
    const secondLoan: Loan = {
      ...activeLoan,
      id: 'loan-3',
      currency: 'INR',
      outstanding_amount: 500000,
    };
    fromMock.mockReturnValue(
      createQueryBuilder({ data: [activeLoan, secondLoan], error: null }),
    );

    const summary = await service.getActiveSummary();

    expect(summary.count).toBe(2);
    expect(summary.outstandingByCurrency).toEqual({ GBP: 180000, INR: 500000 });
  });

  it('fails unauthenticated operations', async () => {
    authService.user.mockReturnValue(null);

    await expect(service.listActive()).rejects.toThrow(
      'You must be signed in to manage loans.',
    );
  });

  it('produces readable messages for Supabase errors', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: 'permission denied' } }),
    );

    await expect(service.listActive()).rejects.toThrow('permission denied');
  });
});
