'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PencilSquareIcon, PlusIcon, TagIcon } from "@heroicons/react/16/solid";

type PressItem = {
    id: string;
    cat_en: string;
};

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]*>?/gm, "").trim();

const PressCategory = () => {
    const [press, setPress] = useState<PressItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/press-cat`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPress(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchNews();
    }, [router]);

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
                        <h1 className="text-2xl font-bold text-gray-900">Press Categories</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {press.length} categor{press.length === 1 ? "y" : "ies"}
                        </p>
                    </div>
                    <Link href="/admin/press-category/add-press-category" className="admin-btn whitespace-nowrap">
                        <PlusIcon className="size-5" /> Add
                    </Link>
                </div>

                {press.length === 0 ? (
                    <div className="admin-card flex flex-col items-center justify-center px-4 py-16 text-center">
                        <TagIcon className="mb-2 size-10 text-gray-300" />
                        <p className="text-sm text-gray-400">No categories yet.</p>
                    </div>
                ) : (
                    <div className="admin-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3 w-12">#</th>
                                    <th className="px-5 py-3">Category</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {press.map((pressItem) => (
                                    <tr key={pressItem.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs font-medium text-gray-400">#{pressItem.id}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                                                <TagIcon className="size-4 text-gray-400" />
                                                {stripHtml(pressItem.cat_en)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/press-category/view-press-category/${pressItem.id}`}
                                                    className="admin-btn-ghost"
                                                    title="View"
                                                >
                                                    <EyeIcon className="size-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/press-category/edit-press-category/${pressItem.id}`}
                                                    className="admin-btn-ghost"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="size-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PressCategory;
