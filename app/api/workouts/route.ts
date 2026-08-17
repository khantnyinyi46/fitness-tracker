import { createClient } from "@supabase/supabase-js";
import { getUser } from "../../lib/dal";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });

        }

        const { user_id, exercise_name, duration_minutes, workout_date, created_at } = await req.json();
        const { data, error } = await supabase
            .from('workouts')
            .insert([
                {
                    user_id: user_id,
                    exercise_name: exercise_name,
                    duration_minutes: duration_minutes,
                    workout_date: workout_date,
                    created_at: created_at
                }
            ]).select();

        if (error) throw error;
        return NextResponse.json({ success: true, saved: data ? data[0] : null });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });

        }

        const { id, user_id, exercise_name, duration_minutes, workout_date, updated_at } = await req.json();

        const { data, error } = await supabase
            .from('workouts')
            .update({
                user_id: user_id,
                exercise_name: exercise_name,
                duration_minutes: duration_minutes,
                workout_date: workout_date,
                updated_at: updated_at
            })
            .eq('id', id)

        if (error) throw error;
        return NextResponse.json({ success: true, saved: data ? data[0] : null });
    }
    catch (error)
    {
        return NextResponse.json({ error: error }, { status: 500 });

    }
}

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });

        }

        const { data } = await supabase.from('workouts').select().eq('user_id', user.user_id)
        if (!data) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            summary: data.map(item => ({
                id: item.id,
                user_id: item.user_id,
                exercise_name: item.exercise_name,
                duration_minutes: item.duration_minutes,
                workout_date: item.workout_date,
            })),
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(req: Request)
{
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
        }
        const { id } = await req.json();
        const { data, error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.user_id);
        if (error) throw error;
        return NextResponse.json({ success: true, deleted: data ? data[0] : null });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

