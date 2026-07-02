'use client';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, {AxiosError} from 'axios';
import { useRouter } from 'next/navigation';
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

interface Slider {
    id: number;
    image: string;
    en: string;
}

const isVideo = (path?: string) => !!path && /\.(mp4|webm)$/i.test(path);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Hero Video</h2>
                        {sliders.length === 0 && (
                            <Link href="/admin/hero-video/add" className="bg text-white py-2 px-8 rounded-md cursor-pointer flex items-center">
                                <PlusCircleIcon className="w-6 h-6" color="#ffffff" />
                                <div className="ml-2">Add</div>
                            </Link>
                        )}
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Video</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sliders.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center py-4">No hero video available</td>
                            </tr>
                        ) : (
                            sliders.map((slider) => (
                                <tr key={slider.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        {isVideo(slider.image) ? (
                                            <video
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                                muted
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                                alt={`Slider ${slider.id}`}
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link href={`/admin/hero-video/view/${slider.id}`} className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32 justify-center items-center">
                                            <EyeIcon className="w-5 h-5" color="#ffffff" />
                                            <div className="ml-2">View</div>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sliders;
