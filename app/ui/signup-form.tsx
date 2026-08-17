'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useRouter } from "next/navigation";

export default function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)
    const router = useRouter();

    const loginClick = () => {
        router.replace("/login")
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
            <form
                action={action}
                className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md space-y-4"
            >
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        placeholder="Name"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    {state?.errors?.name && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        placeholder="Email"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    {state?.errors?.email && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    {state?.errors?.password && (
                        <div className="mt-2 text-sm text-red-600 space-y-1">
                            <p className="font-medium">Password must:</p>
                            <ul className="list-none pl-1">
                                {state.errors.password.map((error) => (
                                    <li key={error}>- {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {state?.message && (
                    <p className="mt-1 text-sm text-red-600">{state.message}</p>
                )}

                <button
                    disabled={pending}
                    type="submit"
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {pending ? "Signing up..." : "Sign Up"}
                </button>
                <span className="flex gap-2">
                    <p className="text-sm">Already have an account ?</p>
                    <button type="button" onClick={ loginClick } className="text-sm text-blue-500 hover:text-blue-700">Login here</button>
                </span>
            </form>
        </div>

    )
}