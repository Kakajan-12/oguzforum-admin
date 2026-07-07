'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import TipTap from '@/Components/TipTapEditor';
import GalleryPicker from '@/Components/GalleryPicker';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {
    DocumentIcon,
    PlusIcon,
    TrashIcon,
    ArrowLeftIcon,
    PhotoIcon,
} from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";

interface Organizer {
    id?: number;
    organizer_en: string;
    organizer_logo?: string | null;
}

interface Participant {
    id?: number;
    participant_en: string;
    participant_logo?: string | null;
}


const EditProject = () => {
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        image: '',
        logo: '',
        en: '',
        short_en: '',
        text_en: '',
        date:"",
        end_date:"",
        link:"",
        location_id: '',
        type_id: '',
        speakers: '',
        delegates: '',
        countries:'',
        companies:'',
        media:'',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePath, setImagePath] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPath, setLogoPath] = useState('');
    const [logoRemoved, setLogoRemoved] = useState(false);
    const [galleryImages, setGalleryImages] = useState<{ id: number; image: string }[]>([]);
    const [newGallery, setNewGallery] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<{
        id: number,
        location_en: string
    }[]>([]);
    const [types, setTypes] = useState<{
        id: number,
        type_en: string
    }[]>([]);
    const [organizers, setOrganizers] = useState<
        { id?: number; organizer_en: string; organizer_logo?: File | string | null; _deleted?: boolean }[]
    >([]);

    const addOrganizer = () =>
        setOrganizers(prev => [...prev, { organizer_en: '', organizer_logo: null }]);

    const removeOrganizer = (index: number) =>
        setOrganizers(prev => prev.map((o, i) => i === index ? { ...o, _deleted: true } : o));

    const updateOrganizer = (index: number, field: string, value: string | File | null) =>
        setOrganizers(prev => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));

    const [participants, setParticipants] = useState<
        { id?: number; participant_en: string; participant_logo?: File | string | null; _deleted?: boolean }[]
    >([]);

    const addParticipant = () =>
        setParticipants(prev => [...prev, { participant_en: '', participant_logo: null }]);

    const removeParticipant = (index: number) =>
        setParticipants(prev => prev.map((p, i) => i === index ? { ...p, _deleted: true } : p));

    const updateParticipant = (index: number, field: string, value: string | File | null) =>
        setParticipants(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));



    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке локаций:', err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/types`);
                const data = await res.json();
                setTypes(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchTypes();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';
                    const formattedEndDate = rawData.end_date
                        ? new Date(rawData.end_date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        date: formattedDate,
                        end_date: formattedEndDate,
                    });

                    setImagePath(rawData.image);
                    setLogoPath(rawData.logo);
                    setGalleryImages(rawData.images || []);

                    if (Array.isArray(rawData.organizers)) {
                        const formattedOrganizers = rawData.organizers.map((org: Organizer) => ({
                            id: org.id,
                            organizer_en: org.organizer_en || '',
                            organizer_logo: org.organizer_logo || null,
                        }));
                        setOrganizers(formattedOrganizers);
                    }

                    if (Array.isArray(rawData.participants)) {
                        setParticipants(rawData.participants.map((p: Participant) => ({
                            id: p.id,
                            participant_en: p.participant_en || '',
                            participant_logo: p.participant_logo || null,
                        })));
                    }

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этого проекта");
                }

            } catch (err) {
                console.error('Ошибка при загрузке проекта:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);


    const handleEditorChange = (name: keyof typeof data, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    // Clear the logo entirely: drop any pending file, hide the preview and send
    // an empty `logo` on save so the backend sets the column to NULL.
    const removeLogo = () => {
        setLogoFile(null);
        setLogoPath('');
        setLogoRemoved(true);
        setData((prev) => ({ ...prev, logo: '' }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();

            Object.entries(data).forEach(([key, val]) => {
                formData.append(key, val ?? '');
            });

            if (imageFile) formData.append("image", imageFile);
            if (logoFile) formData.append("logo", logoFile);

            formData.append("en", data.en);
            formData.append("short_en", data.short_en || "");
            formData.append("text_en", data.text_en);
            formData.append("date", data.date);
            formData.append("end_date", data.end_date);
            formData.append("link", data.link);
            formData.append("location_id", String(data.location_id));
            formData.append("type_id", String(data.type_id));

            formData.append(
                "organizers",
                JSON.stringify(organizers.filter(o => !o._deleted)) || "[]"
            );


            organizers.forEach(org => {
                if (org._deleted) return;
                if (org.organizer_logo instanceof File) {
                    formData.append("organizer_logo", org.organizer_logo);
                }
            });

            // Participants: keep existing logo paths as strings, mark new ones
            // as null; upload files in the same (active) order so the backend
            // can pair each new file with its (logo-less) entry.
            const activeParticipants = participants.filter(p => !p._deleted);
            formData.append(
                "participants",
                JSON.stringify(activeParticipants.map(p => ({
                    participant_en: p.participant_en,
                    participant_logo: typeof p.participant_logo === 'string' ? p.participant_logo : null,
                })))
            );
            activeParticipants.forEach(p => {
                if (p.participant_logo instanceof File) {
                    formData.append("participant_logo", p.participant_logo);
                }
            });

            // Новые изображения галереи (дозаписываются к существующим)
            newGallery.forEach((f) => formData.append("gallery", f));

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            router.push(`/admin/projects/view-project/${id}`);
        } catch (err) {
            console.error(err);
            setError("Ошибка при сохранении");
            setSaving(false);
        }
    };


    const deleteGalleryImage = async (imageId: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/image/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error('Ошибка при удалении изображения:', err);
        }
    };

    if (loading) return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10 text-gray-500">Загрузка...</div>
        </div>
    );
    if (error && !saving) return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
        </div>
    );

    const activeOrganizers = organizers.filter(o => !o._deleted).length;
    const activeParticipants = participants.filter(p => !p._deleted).length;

    return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer/>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/admin/projects/view-project/${id}`}
                            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1268B3]"
                        >
                            <ArrowLeftIcon className="size-4"/> Back to project
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                        <p className="mt-1 text-sm text-gray-500">Update event details, media and participants.</p>
                    </div>
                    <button
                        type="submit"
                        form="edit-project-form"
                        disabled={saving}
                        className="admin-btn whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <DocumentIcon className="size-5"/>
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Media */}
                    <section className="admin-card p-6">
                        <h2 className="mb-1 text-lg font-semibold text-gray-900">Media</h2>
                        <p className="mb-5 text-sm text-gray-500">Cover image and logo for this project.</p>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <span className="admin-label">Cover image</span>
                                {imagePath ? (
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace(/\\/g, '/')}`}
                                        alt="Project"
                                        width={320}
                                        height={200}
                                        className="mb-3 h-40 w-full max-w-xs rounded-lg border border-gray-200 object-cover"
                                    />
                                ) : (
                                    <div className="mb-3 flex h-40 w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-300">
                                        <PhotoIcon className="size-10"/>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                                    className="admin-input file:mr-3 file:rounded-md file:border-0 file:bg-[#1268B3]/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#1268B3]"
                                />
                                {imageFile && <p className="mt-1 text-xs text-green-600">New image selected: {imageFile.name}</p>}
                            </div>

                            <div>
                                <span className="admin-label">Logo</span>
                                {logoPath ? (
                                    <div className="group relative mb-3 h-24 w-24">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${logoPath.replace(/\\/g, '/')}`}
                                            alt="Logo"
                                            width={120}
                                            height={120}
                                            className="h-24 w-24 rounded-lg border border-gray-200 object-contain bg-white p-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white shadow-sm transition-colors hover:bg-red-700"
                                            aria-label="Remove logo"
                                            title="Remove logo"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-300">
                                        <PhotoIcon className="size-8"/>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setLogoFile(e.target.files[0]);
                                            setLogoRemoved(false);
                                        }
                                    }}
                                    className="admin-input file:mr-3 file:rounded-md file:border-0 file:bg-[#1268B3]/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#1268B3]"
                                />
                                {logoFile ? (
                                    <p className="mt-1 text-xs text-green-600">New logo selected: {logoFile.name}</p>
                                ) : logoRemoved && (
                                    <p className="mt-1 text-xs text-amber-600">Logo will be removed on save.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Details */}
                    <section className="admin-card p-6">
                        <h2 className="mb-1 text-lg font-semibold text-gray-900">Event details</h2>
                        <p className="mb-5 text-sm text-gray-500">Schedule, location and category.</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label htmlFor="date" className="admin-label">Start date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={data.date}
                                    onChange={(e) => setData((prev) => ({...prev, date: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="admin-label">End date</label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={data.end_date}
                                    onChange={(e) => setData((prev) => ({...prev, end_date: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="link" className="admin-label">Link</label>
                                <input
                                    type="text"
                                    id="link"
                                    name="link"
                                    value={data.link || ''}
                                    onChange={(e) => setData((prev) => ({...prev, link: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="location_id" className="admin-label">Location</label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={String(data.location_id)}
                                    onChange={(e) => setData((prev) => ({...prev, location_id: e.target.value}))}
                                    required
                                    className="admin-input"
                                >
                                    <option value="">Select location</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={String(loc.id)}>
                                            {loc.location_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="type_id" className="admin-label">Type</label>
                                <select
                                    id="type_id"
                                    name="type_id"
                                    value={String(data.type_id)}
                                    onChange={(e) => setData((prev) => ({...prev, type_id: e.target.value}))}
                                    required
                                    className="admin-input"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={String(type.id)}>
                                            {type.type_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Statistics */}
                    <section className="admin-card p-6">
                        <h2 className="mb-1 text-lg font-semibold text-gray-900">Statistics</h2>
                        <p className="mb-5 text-sm text-gray-500">Numbers shown on the event page.</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label htmlFor="speakers" className="admin-label">Speakers</label>
                                <input
                                    type="text"
                                    id="speakers"
                                    name="speakers"
                                    value={data.speakers || ''}
                                    onChange={(e) => setData((prev) => ({...prev, speakers: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="delegates" className="admin-label">Delegates</label>
                                <input
                                    type="text"
                                    id="delegates"
                                    name="delegates"
                                    value={data.delegates || ''}
                                    onChange={(e) => setData((prev) => ({...prev, delegates: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="countries" className="admin-label">Countries</label>
                                <input
                                    type="text"
                                    id="countries"
                                    name="countries"
                                    value={data.countries || ''}
                                    onChange={(e) => setData((prev) => ({...prev, countries: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="companies" className="admin-label">Companies</label>
                                <input
                                    type="text"
                                    id="companies"
                                    name="companies"
                                    value={data.companies || ''}
                                    onChange={(e) => setData((prev) => ({...prev, companies: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="media" className="admin-label">Media</label>
                                <input
                                    type="text"
                                    id="media"
                                    name="media"
                                    value={data.media || ''}
                                    onChange={(e) => setData((prev) => ({...prev, media: e.target.value}))}
                                    required
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="admin-card p-6">
                        <h2 className="mb-1 text-lg font-semibold text-gray-900">Content</h2>
                        <p className="mb-5 text-sm text-gray-500">Title and description shown on the event page.</p>

                        <div className="space-y-5">
                            <div>
                                <span className="admin-label">Short name <span className="font-normal text-gray-400">(abbreviation, e.g. ITTC)</span></span>
                                <input
                                    type="text"
                                    value={data.short_en || ''}
                                    onChange={(e) => setData((prev) => ({ ...prev, short_en: e.target.value }))}
                                    maxLength={50}
                                    placeholder="ITTC"
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <span className="admin-label">Title</span>
                                <TipTap
                                    content={data.en || ''}
                                    onChange={(content) => handleEditorChange('en', content)}
                                />
                            </div>
                            <div>
                                <span className="admin-label">Text</span>
                                <TipTap
                                    content={data.text_en || ''}
                                    onChange={(content) => handleEditorChange('text_en', content)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Organizers */}
                    <section className="admin-card p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Organizers</h2>
                                <p className="mt-1 text-sm text-gray-500">{activeOrganizers} organizer{activeOrganizers === 1 ? "" : "s"}</p>
                            </div>
                            <button type="button" onClick={addOrganizer} className="admin-btn-ghost">
                                <PlusIcon className="size-4"/> Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {activeOrganizers === 0 && (
                                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
                                    No organizers yet.
                                </p>
                            )}
                            {organizers.map((org, index) => (
                                !org._deleted && (
                                    <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start gap-4">
                                            {typeof org.organizer_logo === 'string' && org.organizer_logo ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${org.organizer_logo.replace(/\\/g, '/')}`}
                                                    alt="org logo"
                                                    width={64}
                                                    height={64}
                                                    className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-300">
                                                    <PhotoIcon className="size-6"/>
                                                </div>
                                            )}
                                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                    <span className="admin-label">Organizer</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Organizer name"
                                                        value={org.organizer_en}
                                                        onChange={(e) => updateOrganizer(index, 'organizer_en', e.target.value)}
                                                        className="admin-input"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="admin-label">Logo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            updateOrganizer(index, 'organizer_logo', e.target.files?.[0] || null)
                                                        }
                                                        className="admin-input file:mr-3 file:rounded-md file:border-0 file:bg-[#1268B3]/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#1268B3]"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeOrganizer(index)}
                                                className="admin-btn-danger shrink-0"
                                                title="Remove"
                                            >
                                                <TrashIcon className="size-4"/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>

                    {/* Participants */}
                    <section className="admin-card p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Participant companies</h2>
                                <p className="mt-1 text-sm text-gray-500">{activeParticipants} compan{activeParticipants === 1 ? "y" : "ies"}</p>
                            </div>
                            <button type="button" onClick={addParticipant} className="admin-btn-ghost">
                                <PlusIcon className="size-4"/> Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {activeParticipants === 0 && (
                                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
                                    No participant companies yet.
                                </p>
                            )}
                            {participants.map((prt, index) => (
                                !prt._deleted && (
                                    <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start gap-4">
                                            {typeof prt.participant_logo === 'string' && prt.participant_logo ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${prt.participant_logo.replace(/\\/g, '/')}`}
                                                    alt="company logo"
                                                    width={64}
                                                    height={64}
                                                    className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-300">
                                                    <PhotoIcon className="size-6"/>
                                                </div>
                                            )}
                                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                    <span className="admin-label">Company name</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Company name (optional)"
                                                        value={prt.participant_en}
                                                        onChange={(e) => updateParticipant(index, 'participant_en', e.target.value)}
                                                        className="admin-input"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="admin-label">Logo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            updateParticipant(index, 'participant_logo', e.target.files?.[0] || null)
                                                        }
                                                        className="admin-input file:mr-3 file:rounded-md file:border-0 file:bg-[#1268B3]/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#1268B3]"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeParticipant(index)}
                                                className="admin-btn-danger shrink-0"
                                                title="Remove"
                                            >
                                                <TrashIcon className="size-4"/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <section className="admin-card p-6">
                        <h2 className="mb-1 text-lg font-semibold text-gray-900">Gallery</h2>
                        <p className="mb-5 text-sm text-gray-500">Additional images for this project.</p>

                        {galleryImages.length > 0 ? (
                            <div className="mb-4 flex flex-wrap gap-3">
                                {galleryImages.map((img) => (
                                    <div key={img.id} className="group relative">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${img.image.replace(/\\/g, '/')}`}
                                            alt="Gallery"
                                            width={128}
                                            height={96}
                                            className="h-24 w-32 rounded-lg border border-gray-200 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteGalleryImage(img.id)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white shadow-sm transition-colors hover:bg-red-700"
                                            aria-label="Delete image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mb-4 text-sm text-gray-400">No gallery images yet.</p>
                        )}
                        <GalleryPicker
                            files={newGallery}
                            onChange={setNewGallery}
                            label="Add gallery images"
                        />
                    </section>

                    {/* Sticky actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={`/admin/projects/view-project/${id}`} className="admin-btn-ghost">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="admin-btn disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <DocumentIcon className="size-5"/>
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;
