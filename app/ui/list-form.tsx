'use client'
import { useEffect, useState } from "react";
import { Workout } from "../lib/definitions";
import { useRouter } from "next/navigation";

export default function ListForm() {
    const [data, setData] = useState<Workout[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    async function loadWorkouts() {
        const res = await fetch('/api/workouts');
        const data = await res.json();
        if (res.ok && data.success) {
            return Array.isArray(data.summary) ? data.summary : [];
        }
    }

    useEffect(() => {

        const result = loadWorkouts();
        result.then((workouts) => {
            if (workouts) {
                setData(workouts);
            }
        }).catch((error) => {
            console.error('Failed to load workouts:', error);
        });

    }, []);

    const deleteBtnClick = async (id: string) => {
        try {
            setSubmitting(true);
            const response = await fetch('/api/workouts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,

                }),
            });

            if (!response.ok) {
                throw new Error("Server rejected insert action");
            }
        }
        catch (error) {
            console.error(error);

        }
        finally {
            const result = loadWorkouts();
            result.then((workouts) => {
                if (workouts) {
                    setData(workouts);
                }
            }).catch((error) => {
                console.error('Failed to load workouts:', error);
            });
            setSubmitting(false);

        }
    }

    const updateBtnClick = async (id: string) => {
        setSubmitting(true);
        router.push(`/update/${id}`);

    }


    return (
        <div className="overflow-x-auto px-3 py-3 text-xl">

            <div className="table w-full border-collapse border border-slate-700 shadow-md rounded-lg">
                {/* Header */}
                <div className="table-header-group bg-gray-800 text-white">
                    <div className="table-row">
                        <div className="table-cell px-4 py-3 border border-slate-600 font-semibold text-left">ID</div>
                        <div className="table-cell px-4 py-3 border border-slate-600 font-semibold text-left">Exercise Name</div>
                        <div className="table-cell px-4 py-3 border border-slate-600 font-semibold text-left">Duration (min)</div>
                        <div className="table-cell px-4 py-3 border border-slate-600 font-semibold text-left">Workout Date</div>
                        <div className="table-cell px-4 py-3 border border-slate-600 font-semibold text-left">Actions</div>
                    </div>
                </div>

                {/* Body */}
                <div className="table-row-group">
                    {data.map((item: Workout) => (
                        <div className="table-row hover:bg-gray-100 transition-colors" key={item.id}>
                            <div className="table-cell px-4 py-2 border border-slate-600">{item.id}</div>
                            <div className="table-cell px-4 py-2 border border-slate-600">{item.exercise_name}</div>
                            <div className="table-cell px-4 py-2 border border-slate-600">{item.duration_minutes}</div>
                            <div className="table-cell px-4 py-2 border border-slate-600">{item.workout_date}</div>
                            <div className="table-cell px-4 py-2 border border-slate-600">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        disabled={submitting || item.id == undefined}
                                        onClick={() => deleteBtnClick(item.id)}
                                        className={`px-3 py-1 text-white rounded
                                        ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting || item.id == undefined}
                                        onClick={() => updateBtnClick(item.id)}
                                        className={`px-3 py-1 text-white rounded
                                        ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}
