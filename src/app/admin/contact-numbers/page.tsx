'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilSquareIcon, PlusIcon, TrashIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/16/solid";

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
        return (
            <div className="admin-page flex">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer />

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Numbers</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {numbers.length} number{numbers.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <Link href="/admin/contact-numbers/add-number" className="admin-btn whitespace-nowrap">
                        <PlusIcon className="size-5" /> Add
                    </Link>
                </div>

                {numbers.length === 0 ? (
                    <div className="admin-card flex flex-col items-center justify-center px-4 py-16 text-center">
                        <PhoneIcon className="mb-2 size-10 text-gray-300" />
                        <p className="text-sm text-gray-400">No numbers yet.</p>
                    </div>
                ) : (
                    <div className="admin-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3">Number</th>
                                    <th className="px-5 py-3">Location</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {numbers.map((number) => (
                                    <tr key={number.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <a href={`tel:${number.number}`} className="inline-flex items-center gap-2 font-medium text-gray-800 hover:text-[#1268B3]">
                                                <PhoneIcon className="size-4 text-gray-400" />
                                                {number.number}
                                            </a>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-2 text-gray-600">
                                                <MapPinIcon className="size-4 text-gray-400" />
                                                {number.location_en}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/contact-numbers/edit-number/${number.id}`}
                                                    className="admin-btn-ghost"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="size-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedNumberId(number.id);
                                                        setShowModal(true);
                                                    }}
                                                    className="admin-btn-danger"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/40"
                            onClick={() => !isDeleting && setShowModal(false)}
                        />
                        <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <TrashIcon className="size-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Delete number</h2>
                            </div>
                            <p className="mb-6 text-sm text-gray-500">
                                Are you sure you want to delete this contact number? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="admin-btn-ghost"
                                    onClick={() => setShowModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
