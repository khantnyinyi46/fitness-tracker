import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from './auth';
import { verifyPassword } from '../lib/bcryptjs';

// Intercept the Supabase client BEFORE auth.ts imports and instantiates it.
const mockFrom = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: (...args: unknown[]) => mockFrom(...args),
    })),
}));

vi.mock('../lib/bcryptjs', () => ({
    verifyPassword: vi.fn(),
}));

vi.mock('../lib/session', () => ({
    createSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => {
        throw new Error('NEXT_REDIRECT');
    }),
}));

vi.mock('next/dist/client/components/redirect-error', () => ({
    isRedirectError: (err: unknown) => err instanceof Error && err.message === 'NEXT_REDIRECT',
}));

describe('login()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error when fields are invalid', async () => {
        const formData = new FormData();
        formData.set('email', '');
        formData.set('password', '');

        const result = await login(undefined, formData);

        expect(result?.errors).toBeDefined();
    });

    it('returns message when email does not exists', async () => {
        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null })
                }),
            }),
        }));

        const formData = new FormData();
        formData.set('email', 'test_1@example.com');
        formData.set('password', 'SecurePass123!');

        const result = await login(undefined, formData);

        expect(result?.message).toBe(
            'This email address does not exist.'
        );
    });

    it('returns message when password is incorrect', async () => {
        // Supabase returns a user
        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({
                        data: { user_id: 1, password: 'hashed_pw' },
                        error: null
                    })
                }),
            }),
        }));

        // Password check fails
        vi.mocked(verifyPassword).mockResolvedValueOnce(false);

        const formData = new FormData();
        formData.set('email', 'test@example.com');
        formData.set('password', 'WrongPassword');

        const result = await login(undefined, formData);

        expect(result?.message).toBe('Incorrect password.');
    });

    it('redirects when password is correct', async () => {
        // Supabase returns a user
        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({
                        data: { user_id: 1, password: 'hashed_pw' },
                        error: null
                    })
                }),
            }),
        }));

        // Password check succeeds
        vi.mocked(verifyPassword).mockResolvedValueOnce(true);

        const formData = new FormData();
        formData.set('email', 'test@example.com');
        formData.set('password', 'SecurePass123!');

        await expect(login(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');
    });
});