import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
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

describe('GET /api/workouts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if there is no authenticated user', async () => {
        vi.mocked(getUser).mockResolvedValueOnce(null);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized session');
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns 404 if no data is returned from the database', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: null, error: null }),
            }),
        }));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('No data found');
    });

    it('returns an empty summary list when the user has no workouts yet', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: [], error: null }),
            }),
        }));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.summary).toEqual([]);
    });

    it('returns the mapped workout summary on success', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        const dbRows = [
            {
                id: 'w1',
                user_id: 'abc123',
                exercise_name: 'Running',
                duration_minutes: 30,
                workout_date: '2026-08-14',
                created_at: '2026-08-14T10:00:00Z', // present in DB row, should be dropped from summary
            },
        ];

        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: dbRows, error: null }),
            }),
        }));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.summary).toEqual([
            {
                id: 'w1',
                user_id: 'abc123',
                exercise_name: 'Running',
                duration_minutes: 30,
                workout_date: '2026-08-14',
            },
        ]);
        expect(data.summary[0].created_at).toBeUndefined();
    });
});