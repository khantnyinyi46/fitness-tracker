'use client'

import { useRouter } from "next/navigation";
import { logout } from "../actions/auth";
export default function NavBar() {
    const router = useRouter();

    const createBtnClick = () => {
        router.push('/create');

    }

    const logoutWrapper = async () => {
        await logout();
    }

    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white font-bold text-xl tracking-wide">Fitness Tracker</div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => createBtnClick()}
                        className="text-white hover:bg-gray-700 active:bg-gray-600 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200">
                            Create
                    </button>
                    <button 
                        type="button"
                        onClick={() => logoutWrapper()}
                        className="text-white hover:bg-gray-700 active:bg-gray-600 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200">
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    )
}
