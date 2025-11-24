'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import {Editor} from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

interface Organizer {
    id?: number;
    organizer_tk: string;
    organizer_en: string;
    organizer_ru: string;
    organizer_logo?: string | null;
}


const EditProject = () => {
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        image: '',
        logo: '',
        tk: '',
        en: '',
        ru: '',
        text_tk: '',
        text_en: '',
        text_ru: '',
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<{
        id: number,
        location_tk: string,
        location_en: string,
        location_ru: string
    }[]>([]);
    const [types, setTypes] = useState<{
        id: number,
        type_tk: string,
        type_en: string,
        type_ru: string
    }[]>([]);
    const [organizers, setOrganizers] = useState<
        { id?: number; organizer_tk: string; organizer_en: string; organizer_ru: string; organizer_logo?: File | string | null; _deleted?: boolean }[]
    >([]);

    const addOrganizer = () =>
        setOrganizers(prev => [...prev, { organizer_tk: '', organizer_en: '', organizer_ru: '', organizer_logo: null }]);

    const removeOrganizer = (index: number) =>
        setOrganizers(prev => prev.map((o, i) => i === index ? { ...o, _deleted: true } : o));

    const updateOrganizer = (index: number, field: string, value: string | File | null) =>
        setOrganizers(prev => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));



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

                    if (Array.isArray(rawData.organizers)) {
                        const formattedOrganizers = rawData.organizers.map((org: Organizer) => ({
                            id: org.id,
                            organizer_tk: org.organizer_tk || '',
                            organizer_en: org.organizer_en || '',
                            organizer_ru: org.organizer_ru || '',
                            organizer_logo: org.organizer_logo || null,
                        }));
                        setOrganizers(formattedOrganizers);
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();

            Object.entries(data).forEach(([key, val]) => {
                formData.append(key, val ?? '');
            });

            if (imageFile) formData.append("image", imageFile);
            if (logoFile) formData.append("logo", logoFile);

            formData.append("tk", data.tk);
            formData.append("en", data.en);
            formData.append("ru", data.ru);
            formData.append("text_tk", data.text_tk);
            formData.append("text_en", data.text_en);
            formData.append("text_ru", data.text_ru);
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
        }
    };


    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {imagePath && (
                            <div>
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace(/\\/g, '/')}`}
                                    alt="Project"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}
                        {logoPath && (
                            <div className="mt-4">
                                <label className="block font-semibold mb-2">Current logo:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${logoPath.replace(/\\/g, '/')}`}
                                    alt="Logo"
                                    width={100}
                                    height={100}
                                    className="rounded"
                                />
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block font-semibold mb-2">New logo:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setLogoFile(e.target.files[0])}
                                    className="border rounded p-2 w-full"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block font-semibold mb-2">New image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                                    className="border rounded p-2 w-full"
                                />
                            </div>
                        </div>


                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Start date:
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={data.date}
                                    onChange={(e) => setData((prev) => ({...prev, date: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    End date:
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={data.end_date}
                                    onChange={(e) => setData((prev) => ({...prev, end_date: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Link</label>
                                <input
                                    type="text"
                                    id="link"
                                    name="link"
                                    value={data.link || ''}
                                    onChange={(e) => setData((prev) => ({...prev, link: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Location:
                                </label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={String(data.location_id)}
                                    onChange={(e) => setData((prev) => ({...prev, location_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select category</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={String(loc.id)}>
                                            {loc.location_en} / {loc.location_tk} / {loc.location_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Type:
                                </label>
                                <select
                                    id="type_id"
                                    name="type_id"
                                    value={String(data.type_id)}
                                    onChange={(e) => setData((prev) => ({...prev, type_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={String(type.id)}>
                                            {type.type_en} / {type.type_tk} / {type.type_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Speakers</label>
                                <input
                                    type="text"
                                    id="speakers"
                                    name="speakers"
                                    value={data.speakers || ''}
                                    onChange={(e) => setData((prev) => ({...prev, speakers: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Delegates</label>
                                <input
                                    type="text"
                                    id="delegates"
                                    name="delegates"
                                    value={data.delegates || ''}
                                    onChange={(e) => setData((prev) => ({...prev, delegates: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Countries</label>
                                <input
                                    type="text"
                                    id="countries"
                                    name="countries"
                                    value={data.countries || ''}
                                    onChange={(e) => setData((prev) => ({...prev, countries: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Companies</label>
                                <input
                                    type="text"
                                    id="companies"
                                    name="companies"
                                    value={data.companies || ''}
                                    onChange={(e) => setData((prev) => ({...prev, companies: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Media</label>
                                <input
                                    type="text"
                                    id="media"
                                    name="media"
                                    value={data.media || ''}
                                    onChange={(e) => setData((prev) => ({...prev, media: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                        </div>

                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.tk || ''}
                                        onEditorChange={(content) => handleEditorChange('tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_tk || ''}
                                        onEditorChange={(content) => handleEditorChange('text_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.en || ''}
                                        onEditorChange={(content) => handleEditorChange('en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_en || ''}
                                        onEditorChange={(content) => handleEditorChange('text_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.ru || ''}
                                        onEditorChange={(content) => handleEditorChange('ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_ru || ''}
                                        onEditorChange={(content) => handleEditorChange('text_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Organizers</h3>

                            {organizers.map((org, index) => (
                                !org._deleted && (
                                    <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Organizer (TM)"
                                                value={org.organizer_tk}
                                                onChange={(e) => updateOrganizer(index, 'organizer_tk', e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Organizer (EN)"
                                                value={org.organizer_en}
                                                onChange={(e) => updateOrganizer(index, 'organizer_en', e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Organizer (RU)"
                                                value={org.organizer_ru}
                                                onChange={(e) => updateOrganizer(index, 'organizer_ru', e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    updateOrganizer(index, 'organizer_logo', e.target.files?.[0] || null)
                                                }
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>

                                        {typeof org.organizer_logo === 'string' && org.organizer_logo && (
                                            <div className="mt-2">
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${org.organizer_logo.replace(/\\/g, '/')}`}
                                                    alt="org logo"
                                                    width={100}
                                                    height={100}
                                                    className="rounded"
                                                />
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => removeOrganizer(index)}
                                            className="text-red-600 text-sm mt-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            ))}

                            <button
                                type="button"
                                onClick={addOrganizer}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                + Add organizer
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2"/>
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProject;
