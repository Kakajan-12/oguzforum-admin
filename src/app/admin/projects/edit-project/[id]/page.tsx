'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import {Editor} from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

const EditProject = () => {
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        image: '',
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
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [locations, setLocations] = useState<{
        id: number,
        location_tk: string,
        location_en: string,
        location_ru: string
    }[]>([]);

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
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
                    headers: {Authorization: `Bearer ${token}`}
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
                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
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

            // если новое изображение выбрано → добавляем
            if (imageFile) {
                formData.append("image", imageFile);
            } else {
                // если не выбрано → оставляем старое значение (например путь)
                formData.append("image", imagePath);
            }

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

                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block font-semibold mb-2">New image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                                    className="border rounded p-2 w-full"
                                />
                            </div>
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
