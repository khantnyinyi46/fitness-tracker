import { describe, it, expect, vi, beforeEach } from 'vitest';
import {  PUT } from './route';
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('PUT /api/workouts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if there is no authenticated user', async () => {
        vi.mocked(getUser).mockResolvedValueOnce(null);

        const request = makeRequest({
            id:'w1',
            user_id: 'abc123',
            exercise_name: 'Running',
            duration_minutes: 20,
            workout_date: '2026-08-15',
            updated_at: '2026-08-15T10:00:00Z',
        });

        const response = await PUT(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized session');
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns 500 if the database update fails', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        mockFrom.mockImplementationOnce(() => ({
            update: () => ({
                    eq: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
            }),
        }));

        const request = makeRequest({
            id: 'w1',
            user_id: 'abc123',
            exercise_name: 'Running',
            duration_minutes: 20,
            workout_date: '2026-08-15',
            updated_at: '2026-08-15T10:00:00Z',
        });

        const response = await PUT(request);

        expect(response.status).toBe(500);
    });

    it('update a workout and returns it on success', async () => {
        vi.mocked(getUser).mockResolvedValueOnce({ user_id: 'abc123' } as never);

        const savedWorkout = {
            id: 'w1',
            user_id: 'abc123',
            exercise_name: 'Running',
            duration_minutes: 20,
            workout_date: '2026-08-15',
            updated_at: '2026-08-15T10:00:00Z',
        };

        mockFrom.mockImplementationOnce(() => ({
            update: () => ({
                    eq: () => Promise.resolve({ data: [savedWorkout], error: null }),
            }),
        }));

        const request = makeRequest({
            id: 'w1',
            user_id: 'abc123',
            exercise_name: 'Running',
            duration_minutes: 20,
            workout_date: '2026-08-15',
            updated_at: '2026-08-15T10:00:00Z',
        });

        const response = await PUT(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.saved).toEqual(savedWorkout);
    });
});