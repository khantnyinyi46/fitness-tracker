import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getUser } from '@/app/lib/dal';

const mockFrom = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: (...args: unknown[]) => mockFrom(...args),
    })),
}));

vi.mock('@/app/lib/dal', () => ({
    getUser: vi.fn(),
}));

function makeRequest(body: unknown) {
    return new Request('http://localhost:3000/api/workouts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('DELETE /api/workouts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if there is no authenticated user', async () => {
        vi.mocked(getUser).mockResolvedValueOnce(null);

        const request = makeRequest({
            id: 'w1'
        });

        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized session');
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns 500 if the database delete fails', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);
        mockFrom.mockImplementationOnce(() => ({
            delete: () => ({
                eq: () => ({
                    eq: () => Promise.resolve({
                        data: null,
                        error: { message: 'DB error' }
                    })
                })
            }),
        }));
        const request = makeRequest({
            id: 'w1'
        });
        const response = await DELETE(request);
        expect(response.status).toBe(500);
    });

    it('returns 200 and success if the workout is deleted successfully', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);
        mockFrom.mockImplementationOnce(() => ({
            delete: () => ({
                eq: () => ({
                    eq: () => Promise.resolve({
                        data: [{ id: 'w1' }],
                        error: null
                    })
                })
            }),
        }));
        const request = makeRequest({
            id: 'w1'
        });
        const response = await DELETE(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.deleted).toEqual({ id: 'w1' });
    });
});