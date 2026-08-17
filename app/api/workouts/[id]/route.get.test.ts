import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getUser } from '@/app/lib/dal';
import { NextRequest } from "next/server";

const mockFrom = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: (...args: unknown[]) => mockFrom(...args),
    })),
}));

vi.mock('@/app/lib/dal', () => ({
    getUser: vi.fn(),
}));

function makeContext(id: string) {
    return { params: Promise.resolve({ id }) };
}

describe('GET /api/workouts/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if there is no authenticated user', async () => {
        vi.mocked(getUser).mockResolvedValueOnce(null);

        const req = new Request('http://localhost:3000/api/workouts/w1');
        const context = makeContext('w1');

        const response = await GET(req as NextRequest, context);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized session');
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns 500 if the database select fails', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => ({
                    eq: () => ({
                        single: () => Promise.resolve({
                            data: null,
                            error: { message: 'DB error' }
                        })
                    })
                })
            }),
        }));

        const req = new Request('http://localhost:3000/api/workouts/w1');
        const context = makeContext('w1');

        const response = await GET(req as NextRequest, context);

        expect(response.status).toBe(500);
    });

    it('returns 200 and the workout on success', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        const workout = {
            id: 'w1',
            user_id: 'abc123',
            exercise_name: 'Running',
            duration_minutes: 30,
            workout_date: '2026-08-14',
            created_at: '2026-08-14T10:00:00Z',
        };

        mockFrom.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => ({
                    eq: () => ({
                        single: () => Promise.resolve({
                            data: workout,
                            error: null
                        })
                    })
                })
            }),
        }));

        const req = new Request('http://localhost:3000/api/workouts/w1');
        const context = makeContext('w1');

        const response = await GET(req as NextRequest, context);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.workout).toEqual(workout);
    });
});
