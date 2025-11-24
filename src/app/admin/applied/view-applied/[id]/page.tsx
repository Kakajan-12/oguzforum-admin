'use client';
import React, {Fragment, useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {Menu, Transition} from "@headlessui/react";
import {ChevronDownIcon, TrashIcon} from "@heroicons/react/16/solid";

interface AppliedData {
    id: number;
    name: string;
    surname: string;
    email: string;
    number: string;
    portfolio: string;
    cv: string;
    en: string;
}

const ViewApplied = () => {
    const { id } = useParams();
    const [data, setData] = useState<AppliedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/apply-job/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setData(response.data[0]);
                console.log('Response data:', response.data);
            } catch (err: unknown) {
                console.error("Ошибка при загрузке:", err);
                setError('Ошибка при загрузке');

                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchData();
    }, [id, router]);

    if (error) return <div>{error}</div>;
    if (!data) return <div>Загрузка...</div>;
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/apply-job/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsDeleting(false);
            setShowModal(false);
            router.push('/admin/applied');
        } catch (err: unknown) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };
    return (
        <div className="flex bg-gray-200 h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">View Applied</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white shadow-inner hover:bg-gray-700 focus:outline-none cursor-pointer">
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
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    Delete
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-4 rounded-md border-gray-200 flex">
                        <div className="space-y-4 ml-4">
                            {data.name && (
                                <div>
                                    <strong>Name:</strong>
                                    <p>{data.name}</p>
                                </div>
                            )}
                            {data.surname && (
                                <div>
                                    <strong>Surname:</strong>
                                    <p>{data.surname}</p>
                                </div>
                            )}
                            {data.email && (
                                <div>
                                    <strong>Email:</strong>
                                    <p>{data.email}</p>
                                </div>
                            )}
                            {data.number && (
                                <div>
                                    <strong>Number:</strong>
                                    <p>{data.number}</p>
                                </div>
                            )}

                            {data.portfolio && (
                                <div className="flex flex-col gap-x-2">
                                    <strong>Portfolio:</strong>
                                    <div className="flex space-x-2 items-center">
                                        <Image src="/pdf.png" alt="pdf" width={30} height={30}
                                               className="rounded mb-6"/>
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${data.portfolio}`}
                                            download
                                            className="text-blue-600 underline"
                                        >
                                            Download PDF
                                        </a>

                                    </div>
                                </div>
                            )}

                            {data.cv && (
                                <div className="flex flex-col gap-x-2">
                                    <strong>CV:</strong>
                                    <div className="flex space-x-2 items-center">
                                        <Image src="/pdf.png" alt="pdf" width={30} height={30}
                                               className="rounded mb-6"/>
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${data.cv}`}
                                            download
                                            className="text-blue-600 underline"
                                        >
                                            Download PDF
                                        </a>

                                    </div>
                                </div>
                            )}
                            <div className="font-bold">Career name:</div>
                            {data.en && (
                                <div>
                                    <p>{data.en}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-bold mb-4">Remove CV</h2>
                            <p className="mb-6">Are you sure you want to delete this CV?</p>
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

export default ViewApplied;
