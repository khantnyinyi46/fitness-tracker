"use client"
import { useEffect, useState } from "react";
import { getUser } from "../lib/dal";
import { CreateFormSchema } from "../lib/definitions";
import { useRouter } from "next/navigation";

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const formattedDate = `${yyyy}-${mm}-${dd}`;

type UpdateFormProps = {
    id: string;
};

export default function UpdateForm({ id }: UpdateFormProps) {
    const [exerciseName, setExerciseName] = useState('');
    const [exerciseDuration, setExerciseDuration] = useState('')
    const [exerciseDate, setExerciseDate] = useState(formattedDate);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchWorkout() {
            setLoading(true);
            try {
                const response = await fetch(`/api/workouts/${id}`);

                if (!response.ok) {
                    throw new Error("Server rejected insert action");
                }

                const data = await response.json();
                console.log(data.workout);
                setExerciseName(data.workout.exercise_name);
                setExerciseDuration(data.workout.duration_minutes);
                setExerciseDate(data.workout.workout_date);
            } catch (error) {
                console.error('Error fetching workout:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchWorkout();
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validatedFields = CreateFormSchema.safeParse({
            exercise_duration: Number(exerciseDuration),
        })

        if (validatedFields.success) {
            const user = await getUser();

            setSubmitting(true);
            const localTime: string = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Bangkok"
            });

            try {
                const response = await fetch('/api/workouts', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id:id,
                        user_id: user?.user_id,
                        exercise_name: exerciseName,
                        duration_minutes: exerciseDuration,
                        workout_date: exerciseDate,
                        updated_at: localTime
                    }),
                });

                if (!response.ok) {
                    throw new Error("Server rejected insert action");
                }
                resetInputFields();
                router.push('/dashboard');

            }
            catch (error) {
                console.error('Failed to submit review:', error);
                alert('Submission failed.');

            }
            finally {
                setSubmitting(false);
                
            }
        }
    }

    function resetInputFields() {
        setExerciseName('');
        setExerciseDuration('');
        setExerciseDate(formattedDate);
    }

    if(!loading)return (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm p-6 bg-white shadow-md rounded-lg p-6 space-y-4"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Workout Log</h2>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            onChange={(e) => setExerciseName(e.target.value)}
                            value={exerciseName}
                            name="name"
                            placeholder="Running"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <input
                            type="text"
                            onChange={(e) => setExerciseDuration(e.target.value)}
                            value={exerciseDuration}
                            name="duration"
                            placeholder="50"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            onChange={(e) => setExerciseDate(e.target.value)}
                            value={exerciseDate}
                            name="date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold 
      ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {submitting ? "Updating..." : "Update"}
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => router.push('/dashboard')}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold 
      ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        Cancel
                    </button>
                </form>

            </div>

    )
    else return (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-100">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
    )

}