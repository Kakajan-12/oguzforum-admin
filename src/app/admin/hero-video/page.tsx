'use client';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, {AxiosError} from 'axios';
import { useRouter } from 'next/navigation';
import { EyeIcon, PlusIcon, FilmIcon } from "@heroicons/react/16/solid";

interface Slider {
    id: number;
    image: string;
    en: string;
}

const isVideo = (path?: string) => !!path && /\.(mp4|webm)$/i.test(path);
const mediaUrl = (p?: string) =>
    p ? `${process.env.NEXT_PUBLIC_API_URL}/${p.replace(/\\/g, "/")}` : "";

const Sliders = () => {
    const [sliders, setSliders] = useState<Slider[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSliders(response.data);
                setLoading(false);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchSliders();
    }, [router]);

    if (loading) return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10 text-gray-500">Loading...</div>
        </div>
    );
    if (error) return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
        </div>
    );

    return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer />

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hero Video</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            The background media shown in the homepage hero section.
                        </p>
                    </div>
                    {sliders.length === 0 && (
                        <Link href="/admin/hero-video/add" className="admin-btn whitespace-nowrap">
                            <PlusIcon className="size-5" /> Add
                        </Link>
                    )}
                </div>

                {sliders.length === 0 ? (
                    <div className="admin-card flex flex-col items-center justify-center px-4 py-16 text-center">
                        <FilmIcon className="mb-3 size-12 text-gray-300" />
                        <p className="mb-4 text-sm text-gray-400">No hero video yet.</p>
                        <Link href="/admin/hero-video/add" className="admin-btn">
                            <PlusIcon className="size-5" /> Add hero video
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sliders.map((slider) => (
                            <div key={slider.id} className="admin-card flex flex-col overflow-hidden">
                                <div className="aspect-video w-full bg-gray-900">
                                    {isVideo(slider.image) ? (
                                        <video
                                            src={mediaUrl(slider.image)}
                                            muted
                                            loop
                                            playsInline
                                            controls
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={mediaUrl(slider.image)}
                                            alt={`Hero ${slider.id}`}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                        <FilmIcon className="size-4 text-gray-400" />
                                        {isVideo(slider.image) ? "Video" : "Image"}
                                        <span className="font-mono text-xs text-gray-400">#{slider.id}</span>
                                    </span>
                                    <Link
                                        href={`/admin/hero-video/view/${slider.id}`}
                                        className="admin-btn-ghost"
                                        title="View"
                                    >
                                        <EyeIcon className="size-4" /> View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sliders;
