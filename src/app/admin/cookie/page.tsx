'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {PencilSquareIcon, DocumentTextIcon} from "@heroicons/react/16/solid";

interface CookieItem {
    id: number;
    en: string;
}

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]*>?/gm, "").trim();

const Cookie = () => {
    const [cookie, setCookie] = useState<CookieItem[]>([]);

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

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cookie`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCookie(response.data);
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

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
                    <p className="mt-1 text-sm text-gray-500">The cookie policy shown on the website.</p>
                </div>

                {cookie.length === 0 ? (
                    <div className="admin-card flex flex-col items-center justify-center px-4 py-16 text-center">
                        <DocumentTextIcon className="mb-2 size-10 text-gray-300" />
                        <p className="text-sm text-gray-400">No content yet.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {cookie.map((item) => (
                            <div key={item.id} className="admin-card p-6">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1268B3]/10 text-[#1268B3]">
                                            <DocumentTextIcon className="size-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Cookie Policy</p>
                                            <p className="font-mono text-xs text-gray-400">#{item.id}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/cookie/edit-cookie/${item.id}`}
                                        className="admin-btn whitespace-nowrap"
                                    >
                                        <PencilSquareIcon className="size-4" /> Edit
                                    </Link>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                    <p className="line-clamp-6 text-sm leading-relaxed text-gray-600">
                                        {stripHtml(item.en)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cookie;
