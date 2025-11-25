'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";

type Numbers = {
    id: number;
    number: string;
    location_en: string;
};

const ContactNumbers = () => {
    const [numbers, setNumbers] = useState<Numbers[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchNumbers = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    router.push("/");
                    return;
                }

                const response = await axios.get<Numbers[]>(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/contact-numbers`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setNumbers(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchNumbers();
    }, [router]);


    const handleDelete = async () => {
        if (!selectedNumberId) return;
        setIsDeleting(true);

        try {
            const token = localStorage.getItem("auth_token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact-numbers/${selectedNumberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNumbers((prev) => prev.filter((number) => number.id !== selectedNumberId));
            setIsDeleting(false);
            setShowModal(false);
            setSelectedNumberId(null);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Contact Numbers</h2>
                        <Link
                            href="/admin/contact-numbers/add-number"
                            className="bg text-white h-fit py-2 px-6 rounded-md cursor-pointer flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Numbers</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Locations</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Edit</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {numbers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No number available</td>
                            </tr>
                        ) : (
                            numbers.map((number) => (
                                <tr key={number.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">{number.number}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">{number.location_en}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/contact-numbers/edit-number/${number.id}`}
                                            className="bg text-white py-2 px-6 rounded-md flex items-center hover:bg-blue-700 w-fit"
                                        >
                                            <PencilIcon className="w-5 h-5 mr-2" />
                                            Edit
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => {
                                                setSelectedNumberId(number.id);
                                                setShowModal(true);
                                            }}
                                            className="text-white group flex items-center px-4 py-2 text-sm cursor-pointer bg-red-500 rounded-md"
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2 text-white" />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-bold mb-4">Remove Number</h2>
                            <p className="mb-6">Are you sure you want to delete this number?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={() => setShowModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactNumbers;
