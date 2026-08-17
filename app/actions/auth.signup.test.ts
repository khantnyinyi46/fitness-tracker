import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup } from './auth';

// Intercept the Supabase client BEFORE auth.ts imports and instantiates it.
const mockFrom = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: (...args: unknown[]) => mockFrom(...args),
    })),
}));

vi.mock('../lib/bcryptjs', () => ({
    hashPassword: vi.fn(async (pw: string) => `hashed_${pw}`),
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

describe('signup()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error when fields are invalid', async () => {
        const formData = new FormData();
        formData.set('email', '');
        formData.set('password', '');
        formData.set('name', '');

        const result = await signup(undefined, formData);

        expect(result?.errors).toBeDefined();
    });

    it('returns message when email already exists', async () => {
        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: [{ user_id: 1 }], error: null }),
            }),
        }));

        const formData = new FormData();
        formData.set('email', 'test@example.com');
        formData.set('password', 'SecurePass123!');
        formData.set('name', 'Khant');

        const result = await signup(undefined, formData);

        expect(result?.message).toBe(
            'Account with this email already exists. Please enter a different email.'
        );
    });

    it('creates user and redirects', async () => {
        mockFrom
            .mockImplementationOnce(() => ({
                select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
            }))
            .mockImplementationOnce(() => ({
                insert: () => ({
                    select: () => Promise.resolve({ data: [{ user_id: 1 }], error: null }),
                }),
            }));

        const formData = new FormData();
        formData.set('email', 'new@example.com');
        formData.set('password', 'SecurePass123!');
        formData.set('name', 'Khant');

        await expect(signup(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');
    });
});