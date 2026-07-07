'use client';
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilSquareIcon, PlusIcon, TrashIcon, PhotoIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface Partner {
    id: number;
    logo: string;
}

const Partners = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPartners(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchPartners();
    }, [router]);

    // Newest first — highest (most recently added) id on top.
    const sorted = useMemo(
        () => [...partners].sort((a, b) => b.id - a.id),
        [partners]
    );

    const handleDelete = async () => {
        if (!selectedPartnerId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${selectedPartnerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPartners(prev => prev.filter(p => p.id !== selectedPartnerId));
            setIsDeleting(false);
            setShowModal(false);
            setSelectedPartnerId(null);
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
                        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {sorted.length} partner{sorted.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <Link href="/admin/partners/add-partner" className="admin-btn whitespace-nowrap">
                        <PlusIcon className="size-5" /> Add
                    </Link>
                </div>

                {sorted.length === 0 ? (
                    <div className="admin-card flex flex-col items-center justify-center px-4 py-16 text-center">
                        <PhotoIcon className="mb-2 size-10 text-gray-300" />
                        <p className="text-sm text-gray-400">No partners yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {sorted.map((partner) => (
                            <div key={partner.id} className="admin-card group flex flex-col overflow-hidden">
                                <div className="flex h-40 items-center justify-center bg-gray-50 p-6">
                                    {partner.logo ? (
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${partner.logo.replace(/\\/g, "/")}`}
                                            alt={`Partner ${partner.id}`}
                                            width={240}
                                            height={140}
                                            className="max-h-full w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-300">
                                            <PhotoIcon className="size-10" />
                                            <span className="mt-1 text-xs font-medium">No logo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                    <span className="font-mono text-xs font-medium text-gray-400">#{partner.id}</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/partners/edit-partner/${partner.id}`}
                                            className="admin-btn-ghost"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="size-4" />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setSelectedPartnerId(partner.id);
                                                setShowModal(true);
                                            }}
                                            className="admin-btn-danger"
                                            title="Delete"
                                        >
                                            <TrashIcon className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                <h2 className="text-lg font-bold text-gray-900">Delete partner</h2>
                            </div>
                            <p className="mb-6 text-sm text-gray-500">
                                Are you sure you want to delete this partner? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="admin-btn-ghost"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedPartnerId(null);
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Partners;
