'use client';
import React, {useEffect, useState, Fragment} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios, {AxiosError} from 'axios';
import Image from 'next/image';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import {Menu, Transition} from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

type NewsData = {
    image?: string;
    date?: string;
    [key: string]: string | undefined; // для всех других полей
};

const ViewNews = () => {
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState<NewsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setData(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchData();
    }, [id, router]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/news');
        } catch (err) {
            console.error('Ошибка при удалении:', err);
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div className="p-4">Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">View News</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700">
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
                                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => router.push(`/admin/news/edit-news/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex items-center w-full px-4 py-2 text-sm`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100"/>
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex items-center w-full px-4 py-2 text-sm`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Delete
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow space-x-6 flex">
                        <div>
                            {data.image && (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                    alt="News"
                                    width={600}
                                    height={400}
                                    className="rounded"
                                />
                            )}
                            {data.date && (
                                <div>
                                    <strong>Date:</strong>
                                    {new Date(data.date).toLocaleDateString("tm-TM")}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-10 divide-y-1">
                            <div>
                                <div className="font-bold text-lg mb-2">Turkmen</div>
                                {data.tk && (
                                    <div><strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.tk}}/>
                                    </div>
                                )}
                                {data.text_tk && (
                                    <div><strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_tk}}/>
                                    </div>
                                )}
                                {data.cat_tk && (
                                    <div><strong>Category:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.cat_tk}}/>
                                    </div>
                                )}

                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">English</div>
                                {data.en && (
                                    <div><strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.en}}/>
                                    </div>
                                )}
                                {data.text_en && (
                                    <div><strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_en}}/>
                                    </div>
                                )}
                                {data.cat_en && (
                                    <div><strong>Category:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.cat_en}}/>
                                    </div>
                                )}

                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">Russian</div>
                                {data.ru && (
                                    <div><strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.ru}}/>
                                    </div>
                                )}
                                {data.text_ru && (
                                    <div><strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_ru}}/>
                                    </div>
                                )}
                                {data.cat_ru && (
                                    <div><strong>Category:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.cat_ru}}/>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-bold mb-4">Remove news</h2>
                            <p className="mb-6">Are you sure you want to delete this news?</p>
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

export default ViewNews;
