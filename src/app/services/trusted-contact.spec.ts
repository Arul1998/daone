import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TrustedContact, TrustedContactInput } from '../models/trusted-contact';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';
import { TrustedContactService } from './trusted-contact';

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

const sampleInput: TrustedContactInput = {
  full_name: 'Jane Doe',
  relationship: 'Spouse / Partner',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  address: null,
  notes: null,
};

const activeContact: TrustedContact = {
  id: 'contact-1',
  user_id: 'user-1',
  ...sampleInput,
  status: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const archivedContact: TrustedContact = {
  ...activeContact,
  id: 'contact-2',
  status: 0,
};

describe('TrustedContactService', () => {
  let service: TrustedContactService;
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
        TrustedContactService,
        { provide: AuthService, useValue: authService },
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
      ],
    });

    service = TestBed.inject(TrustedContactService);
  });

  it('listActive returns only active contacts', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [activeContact], error: null }));

    const contacts = await service.listActive();

    expect(contacts).toEqual([activeContact]);
    expect(fromMock).toHaveBeenCalledWith('trusted_contacts');
  });

  it('listArchived returns archived contacts', async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: [archivedContact], error: null }));

    const contacts = await service.listArchived();

    expect(contacts).toEqual([archivedContact]);
  });

  it('create adds the authenticated user ID and status 1', async () => {
    const insertBuilder = createQueryBuilder({ data: activeContact, error: null });
    fromMock.mockReturnValue(insertBuilder);

    const created = await service.create(sampleInput);

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      ...sampleInput,
      user_id: 'user-1',
      status: 1,
    });
    expect(created).toEqual(activeContact);
  });

  it('update targets the correct user and contact', async () => {
    const updateBuilder = createQueryBuilder({ data: activeContact, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const updated = await service.update('contact-1', sampleInput);

    expect(updateBuilder.update).toHaveBeenCalledWith(sampleInput);
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'contact-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(updated).toEqual(activeContact);
  });

  it('archive changes status to 0', async () => {
    const updateBuilder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(updateBuilder);

    await service.archive('contact-1');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 0 });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'contact-1');
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('restore changes status to 1', async () => {
    const updateBuilder = createQueryBuilder({ data: activeContact, error: null });
    fromMock.mockReturnValue(updateBuilder);

    const restored = await service.restore('contact-2');

    expect(updateBuilder.update).toHaveBeenCalledWith({ status: 1 });
    expect(restored.status).toBe(1);
  });

  it('counts active contacts in the summary', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: [activeContact, { ...activeContact, id: 'contact-3' }], error: null }),
    );

    const summary = await service.getActiveSummary();

    expect(summary.count).toBe(2);
  });

  it('fails unauthenticated operations', async () => {
    authService.user.mockReturnValue(null);

    await expect(service.listActive()).rejects.toThrow(
      'You must be signed in to manage trusted contacts.',
    );
  });

  it('produces readable messages for Supabase errors', async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: 'permission denied' } }),
    );

    await expect(service.listActive()).rejects.toThrow('permission denied');
  });
});
