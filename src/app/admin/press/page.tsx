'use client'
import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PencilSquareIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

interface PressItem {
    id: number;
    image: string;
    en: string;
    text_en: string;
    cat_en: string;
}

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]*>?/gm, "").trim();

const Press = () => {
    const [press, setPress] = useState<PressItem[]>([]);
    const [search, setSearch] = useState("");
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

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/press`, {
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

    const deleteItem = async (id: number) => {
        if (!window.confirm("Delete this press item? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/press/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPress((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete.");
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const base = q
            ? press.filter((p) => stripHtml(p.en).toLowerCase().includes(q))
            : press;
        // Newest first — highest (most recently added) id on top.
        return [...base].sort((a, b) => b.id - a.id);
    }, [press, search]);

    if (error) {
        return (
            <div className="admin-page flex">
                <Sidebar/>
                <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer/>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Press</h1>
                        <p className="mt-1 text-sm text-gray-500">{filtered.length} item{filtered.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"/>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search press"
                                className="admin-input !w-64 !pl-9"
                            />
                        </div>
                        <Link href="/admin/press/add-press" className="admin-btn whitespace-nowrap">
                            <PlusIcon className="size-5"/> Add
                        </Link>
                    </div>
                </div>

                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">Image</th>
                                <th className="px-5 py-3">Title</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">No press found</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${p.image.replace(/^.*[\\/]/, '')}`}
                                                alt={`Press ${p.id}`}
                                                width={72}
                                                height={48}
                                                className="h-12 w-[72px] rounded-md border border-gray-200 object-cover"
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-800 line-clamp-2 max-w-xl">{stripHtml(p.en)}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/press/view-press/${p.id}`} className="admin-btn-ghost" title="View">
                                                    <EyeIcon className="size-4"/>
                                                </Link>
                                                <Link href={`/admin/press/edit-press/${p.id}`} className="admin-btn-ghost" title="Edit">
                                                    <PencilSquareIcon className="size-4"/>
                                                </Link>
                                                <button onClick={() => deleteItem(p.id)} className="admin-btn-danger" title="Delete">
                                                    <TrashIcon className="size-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Press;
