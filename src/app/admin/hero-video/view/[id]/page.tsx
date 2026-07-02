'use client';
import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios'; // Import AxiosError here
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { Menu, Transition } from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
} from '@heroicons/react/16/solid';

interface Slider {
    id: number;
    image: string;
    en: string;
}

const isVideo = (path?: string) => !!path && /\.(mp4|webm)$/i.test(path);

const ViewSlider = () => {
    const { id } = useParams();
    const [slider, setSlider] = useState<Slider | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Added loading state
    const router = useRouter();

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSlider(response.data[0]);
                setLoading(false); // Set loading to false after fetching data
            } catch (err) {
                console.error("Ошибка при загрузке слайдера:", err);
                setError('Ошибка при загрузке слайдера');
                setLoading(false); // Set loading to false on error

                // Check if error is an AxiosError and handle accordingly
                if (err instanceof AxiosError && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchSlider();
    }, [id, router]);

    if (loading) return <div className="text-center">Загрузка...</div>; // Loading state
    if (error) return <div className="text-red-500 text-center">{error}</div>; // Display error message if any

    return (
        <div className="flex bg-gray-200 h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">View Hero Video</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white shadow-inner hover:bg-gray-700 focus:outline-none cursor-pointer">
                                Options
                                <ChevronDownIcon className="w-4 h-4 fill-white/60"/>
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items
                                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => router.push(`/admin/hero-video/edit/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-4 rounded-md border-gray-200 flex">
                        {slider && slider.image && (
                            isVideo(slider.image) ? (
                                <video
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                    controls
                                    muted
                                    className="rounded mb-6 w-[500px] max-w-full"
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                    alt="Slider"
                                    className="rounded mb-6 w-[500px] max-w-full"
                                />
                            )
                        )}

                        <div className="space-y-10 divide-y-1 ml-4">
                            {slider?.en && (
                                <div>
                                    <strong>Title:</strong>
                                    <div dangerouslySetInnerHTML={{__html: slider.en}}/>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewSlider;
