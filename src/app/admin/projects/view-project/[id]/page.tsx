'use client';
import React, {useEffect, useState, Fragment} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios, {AxiosError} from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {Menu, Transition} from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

interface Organizer {
    id: number;
    organizer_logo: string;
    organizer_tk: string;
    organizer_en: string;
    organizer_ru: string;
}

interface Project {
    id: number;
    image: string;
    logo: string;
    tk: string;
    text_tk: string;
    location_tk: string;
    type_tk: string;
    en: string;
    text_en: string;
    location_en: string;
    type_en: string;
    ru: string;
    text_ru: string;
    date: string;
    end_date: string;
    link: string;
    location_ru: string;
    type_ru: string;
    speakers: string;
    delegates: string;
    countries: string;
    companies: string;
    media: string;
    organizers?: Organizer[];
}

const ViewProject = () => {
    const {id} = useParams();
    const [data, setData] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
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
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsDeleting(false);
            setShowModal(false);
            router.push('/admin/projects');
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) return <div>{error}</div>;
    if (!data) return <div>Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">View Projects</h2>
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
                                                    onClick={() => router.push(`/admin/projects/edit-project/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100"></div>
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
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

                    <div className="bg-white p-4 rounded-md border-gray-200 flex">
                        <div>
                            {data.image && (
                                <div>
                                    <div>Image</div>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                        alt="Projects"
                                        width={500}
                                        height={400}
                                        className="rounded mb-6"
                                    />
                                </div>
                            )}
                            {data.logo && (
                                <div>
                                    <div>Logo</div>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${data.logo.replace('\\', '/')}`}
                                        alt="Projects"
                                        width={100}
                                        height={100}
                                        className="rounded mb-6"
                                    />
                                </div>

                            )}
                            {data.organizers && data.organizers.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4">Organizers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.organizers.map((org) => (
                                            <div key={org.id} className="bg-gray-50 p-4 rounded-lg shadow">
                                                {org.organizer_logo && (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${org.organizer_logo.replace('\\', '/')}`}
                                                        alt={org.organizer_en}
                                                        width={200}
                                                        height={200}
                                                        className="rounded mb-3"
                                                    />
                                                )}
                                                <div>
                                                    <p><strong>TM:</strong> {org.organizer_tk}</p>
                                                    <p><strong>EN:</strong> {org.organizer_en}</p>
                                                    <p><strong>RU:</strong> {org.organizer_ru}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div>
                                    Start date:{" "}
                                    <span className="font-bolder">
                                    {new Date(data.date).toLocaleDateString("tm-TM")}
                                </span>
                                </div>

                                <div>
                                    End date:{" "}
                                    <span className="font-bolder">
                                    {new Date(data.end_date).toLocaleDateString("tm-TM")}
                                </span>
                                </div>
                                <div>
                                    <p>Link: {data.link}</p>
                                </div>
                                <div>
                                    <p>Speakers: {data.speakers}</p>
                                </div>
                                <div>
                                    <p>Delegates: {data.delegates}</p>
                                </div>
                                <div>
                                    <p>Countries: {data.countries}</p>
                                </div>
                                <div>
                                    <p>Companies: {data.companies}</p>
                                </div>
                                <div>
                                    <p>Media: {data.media}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10 divide-y-1 ml-4">
                            <div className="mb-10 space-y-4">
                                <div className="font-bold text-lg mb-4">Turkmen</div>
                                {data.tk && (
                                    <div>
                                        <strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.tk}}/>
                                    </div>
                                )}
                                {data.text_tk && (
                                    <div>
                                        <strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_tk}}/>
                                    </div>
                                )}
                                {data.location_tk && (
                                    <div>
                                        <strong>Location:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.location_tk}}/>
                                    </div>
                                )}
                                {data.type_tk && (
                                    <div>
                                    <strong>Type:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.type_tk}}/>
                                    </div>
                                )}
                            </div>
                            <div className="mb-10 space-y-4">
                                <div className="font-bold text-lg mb-4">English</div>
                                {data.en && (
                                    <div>
                                        <strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.en}}/>
                                    </div>
                                )}

                                {data.text_en && (
                                    <div>
                                        <strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_en}}/>
                                    </div>
                                )}
                                {data.location_en && (
                                    <div>
                                        <strong>Location:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.location_en}}/>
                                    </div>
                                )}
                                {data.type_en && (
                                    <div>
                                        <strong>Type:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.type_en}}/>
                                    </div>
                                )}
                            </div>
                            <div className="mb-10 space-y-4">
                                <div className="font-bold text-lg mb-4">Russian</div>
                                {data.ru && (
                                    <div>
                                        <strong>Title:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.ru}}/>
                                    </div>
                                )}
                                {data.text_ru && (
                                    <div>
                                        <strong>Text:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.text_ru}}/>
                                    </div>
                                )}
                                {data.location_ru && (
                                    <div>
                                        <strong>Location:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.location_ru}}/>
                                    </div>
                                )}
                                {data.type_ru && (
                                    <div>
                                        <strong>Type:</strong>
                                        <div dangerouslySetInnerHTML={{__html: data.type_ru}}/>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-bold mb-4">Remove project</h2>
                            <p className="mb-6">Are you sure you want to delete this project?</p>
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

export default ViewProject;
