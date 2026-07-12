import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth';
import { SupabaseService } from './supabase';

describe('AuthService', () => {
  let service: AuthService;
  let getSessionMock: ReturnType<typeof vi.fn>;
  let onAuthStateChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getSessionMock = vi.fn().mockResolvedValue({ data: { session: null } });
    onAuthStateChangeMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({
              auth: {
                getSession: getSessionMock,
                onAuthStateChange: onAuthStateChangeMock,
              },
            }),
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('initializes once even when called concurrently', async () => {
    await Promise.all([service.init(), service.init(), service.init()]);

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(onAuthStateChangeMock).toHaveBeenCalledTimes(1);
  });

  it('reflects the loaded session state', async () => {
    const session = { user: { id: 'user-1' } };
    getSessionMock.mockResolvedValue({ data: { session } });

    await service.init();

    expect(service.isLoggedIn()).toBe(true);
    expect(service.user()?.id).toBe('user-1');
  });

  it('updates session state on auth state changes', async () => {
    await service.init();
    expect(service.isLoggedIn()).toBe(false);

    const callback = onAuthStateChangeMock.mock.calls[0][0];
    callback('SIGNED_IN', { user: { id: 'user-2' } });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.user()?.id).toBe('user-2');
  });
});
