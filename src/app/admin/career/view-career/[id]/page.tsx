'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import { Menu, Transition } from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

interface CareerData {
    en: string;
    description: string;
    requirements: string;
    job_type: string;
    location: string;
    date: string;
}

const ViewCareer = () => {
    const { id } = useParams();
    const [data, setData] = useState<CareerData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/career/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Полученные данные:', response.data);
                setData(response.data[0]);
            } catch (err) {
                console.error(err);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(err) && err.response?.status === 401) {
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
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/career/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/career');
        } catch (err) {
            console.error('Ошибка при удалении:', err);
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!data) return <div className="p-6">Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">View Career</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700">
                                Options
                                <ChevronDownIcon className="w-4 h-4 fill-white/60" />
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
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => router.push(`/admin/career/edit-career/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2" />
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100" />
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                    Delete
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow space-y-6 mt-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Title</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.en }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Date</h3>
                            {new Date(data.date).toLocaleDateString("en-US")}
                        </div>
                        {data.job_type && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Type</h3>
                                {data.job_type}
                            </div>
                        )}
                        {data.location && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                {data.location}
                            </div>
                        )}
                        {data.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: data.description }}
                                />
                            </div>
                        )}
                        {data.requirements && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: data.requirements }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Remove Career</h3>
                            <p className="mb-6">Are you sure you want to delete this career item?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                                    onClick={() => setShowModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
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

export default ViewCareer;
