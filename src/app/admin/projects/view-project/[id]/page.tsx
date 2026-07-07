'use client';
import React, {useEffect, useState, Fragment} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios, {AxiosError} from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {Menu, Transition} from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    CalendarDaysIcon,
    MapPinIcon,
    LinkIcon,
    PhotoIcon,
    UsersIcon,
    UserGroupIcon,
    GlobeAltIcon,
    BuildingOffice2Icon,
    MicrophoneIcon,
    NewspaperIcon,
} from '@heroicons/react/16/solid';

interface Organizer {
    id: number;
    organizer_logo: string;
    organizer_en: string;
}

interface Participant {
    id: number;
    participant_logo: string;
    participant_en: string;
}

interface GalleryImage {
    id: number;
    image: string;
}

interface Project {
    id: number;
    image: string;
    logo: string;
    en: string;
    text_en: string;
    location_en: string;
    type_en: string;
    date: string;
    end_date: string;
    link: string;
    speakers: string;
    delegates: string;
    countries: string;
    companies: string;
    media: string;
    organizers?: Organizer[];
    participants?: Participant[];
    images?: GalleryImage[];
}

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]*>?/gm, "").trim();

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

    if (error) return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
        </div>
    );
    if (!data) return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10 text-gray-500">Загрузка...</div>
        </div>
    );

    const stats = [
        {label: "Speakers", value: data.speakers, Icon: MicrophoneIcon},
        {label: "Delegates", value: data.delegates, Icon: UsersIcon},
        {label: "Countries", value: data.countries, Icon: GlobeAltIcon},
        {label: "Companies", value: data.companies, Icon: BuildingOffice2Icon},
        {label: "Media", value: data.media, Icon: NewspaperIcon},
    ].filter((s) => s.value);

    const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("en-US", {day: "numeric", month: "short", year: "numeric"}) : "—");

    return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer/>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Link
                            href="/admin/projects"
                            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1268B3]"
                        >
                            <ArrowLeftIcon className="size-4"/> Back to projects
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{stripHtml(data.en) || "Project"}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            {data.type_en && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#1268B3]/10 px-2.5 py-0.5 text-xs font-medium text-[#1268B3]">
                                    {stripHtml(data.type_en)}
                                </span>
                            )}
                            {data.location_en && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPinIcon className="size-4 text-gray-400"/> {stripHtml(data.location_en)}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                                <CalendarDaysIcon className="size-4 text-gray-400"/> {fmt(data.date)} – {fmt(data.end_date)}
                            </span>
                        </div>
                    </div>

                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="admin-btn whitespace-nowrap">
                            Options
                            <ChevronDownIcon className="size-4"/>
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
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg focus:outline-none">
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={() => router.push(`/admin/projects/edit-project/${id}`)}
                                            className={`${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2.5 px-4 py-2.5 text-sm`}
                                        >
                                            <PencilIcon className="size-4 text-gray-400"/>
                                            Edit project
                                        </button>
                                    )}
                                </Menu.Item>
                                <div className="border-t border-gray-100"></div>
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} flex w-full items-center gap-2.5 px-4 py-2.5 text-sm`}
                                        >
                                            <TrashIcon className="size-4"/>
                                            Delete project
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

                {/* Stats */}
                {stats.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {stats.map(({label, value, Icon}) => (
                            <div key={label} className="admin-card flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1268B3]/10 text-[#1268B3]">
                                    <Icon className="size-5"/>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-bold text-gray-900">{value}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Cover */}
                        {data.image && (
                            <section className="admin-card overflow-hidden">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                                    alt="Project"
                                    width={800}
                                    height={450}
                                    className="h-auto w-full object-cover"
                                />
                            </section>
                        )}

                        {/* Content */}
                        {(data.en || data.text_en) && (
                            <section className="admin-card p-6">
                                {data.en && (
                                    <div className="prose max-w-none">
                                        <div className="text-lg font-semibold text-gray-900" dangerouslySetInnerHTML={{__html: data.en}}/>
                                    </div>
                                )}
                                {data.text_en && (
                                    <div
                                        className="prose mt-3 max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{__html: data.text_en}}
                                    />
                                )}
                            </section>
                        )}

                        {/* Organizers */}
                        {data.organizers && data.organizers.length > 0 && (
                            <section className="admin-card p-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Organizers</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {data.organizers.map((org) => (
                                        <div key={org.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                            {org.organizer_logo ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${org.organizer_logo.replace(/\\/g, '/')}`}
                                                    alt={org.organizer_en}
                                                    width={56}
                                                    height={56}
                                                    className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-300">
                                                    <PhotoIcon className="size-6"/>
                                                </div>
                                            )}
                                            <p className="font-medium text-gray-800">{org.organizer_en}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Participants */}
                        {data.participants && data.participants.length > 0 && (
                            <section className="admin-card p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <UserGroupIcon className="size-5 text-gray-400"/> Participant companies
                                </h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                    {data.participants.map((prt) => (
                                        <div key={prt.id} className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                                            {prt.participant_logo ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${prt.participant_logo.replace(/\\/g, '/')}`}
                                                    alt={prt.participant_en}
                                                    width={72}
                                                    height={72}
                                                    className="h-16 w-16 rounded-lg border border-gray-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-300">
                                                    <PhotoIcon className="size-6"/>
                                                </div>
                                            )}
                                            {prt.participant_en && (
                                                <p className="text-xs font-medium text-gray-600">{prt.participant_en}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Gallery */}
                        {data.images && data.images.length > 0 && (
                            <section className="admin-card p-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Gallery</h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {data.images.map((img) => (
                                        <Image
                                            key={img.id}
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${img.image.replace(/\\/g, '/')}`}
                                            alt="Gallery"
                                            width={200}
                                            height={150}
                                            className="h-28 w-full rounded-lg border border-gray-200 object-cover"
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar column */}
                    <div className="space-y-6">
                        {/* Logo */}
                        {data.logo && (
                            <section className="admin-card p-6">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Logo</h3>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.logo.replace(/\\/g, '/')}`}
                                    alt="Logo"
                                    width={160}
                                    height={160}
                                    className="h-32 w-32 rounded-lg border border-gray-200 bg-white object-contain p-2"
                                />
                            </section>
                        )}

                        {/* Details */}
                        <section className="admin-card p-6">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Details</h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-gray-400"/>
                                    <div>
                                        <dt className="text-xs text-gray-400">Dates</dt>
                                        <dd className="font-medium text-gray-800">{fmt(data.date)} – {fmt(data.end_date)}</dd>
                                    </div>
                                </div>
                                {data.location_en && (
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-gray-400"/>
                                        <div>
                                            <dt className="text-xs text-gray-400">Location</dt>
                                            <dd className="font-medium text-gray-800">{stripHtml(data.location_en)}</dd>
                                        </div>
                                    </div>
                                )}
                                {data.type_en && (
                                    <div className="flex items-start gap-3">
                                        <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-gray-400"/>
                                        <div>
                                            <dt className="text-xs text-gray-400">Type</dt>
                                            <dd className="font-medium text-gray-800">{stripHtml(data.type_en)}</dd>
                                        </div>
                                    </div>
                                )}
                                {data.link && (
                                    <div className="flex items-start gap-3">
                                        <LinkIcon className="mt-0.5 size-4 shrink-0 text-gray-400"/>
                                        <div className="min-w-0">
                                            <dt className="text-xs text-gray-400">Link</dt>
                                            <dd className="truncate font-medium text-[#1268B3]">
                                                <a href={data.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {data.link}
                                                </a>
                                            </dd>
                                        </div>
                                    </div>
                                )}
                            </dl>
                        </section>
                    </div>
                </div>

                {/* Delete modal */}
                <Transition show={showModal} as={Fragment}>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/40" onClick={() => !isDeleting && setShowModal(false)}/>
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                        <TrashIcon className="size-5"/>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Delete project</h2>
                                </div>
                                <p className="mb-6 text-sm text-gray-500">
                                    Are you sure you want to delete this project? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        className="admin-btn-ghost"
                                        onClick={() => setShowModal(false)}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Transition>
            </div>
        </div>
    );
};

export default ViewProject;
