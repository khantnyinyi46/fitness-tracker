import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../../lib/dal";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
        }
        const { id } = await context.params;

        const { data, error } = await supabase
            .from('workouts')
            .select()
            .eq('id', id)
            .eq('user_id', user.user_id)
            .single();
        if (error) throw error;
        return NextResponse.json({
            success: true,
            workout: data,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}