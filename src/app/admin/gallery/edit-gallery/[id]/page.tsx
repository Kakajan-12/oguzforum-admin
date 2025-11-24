'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditGallery = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ image: '', project_id: '' });
    const [projects, setProjects] = useState<{ id: number; en: string; tk: string; ru: string }[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return router.push('/');

                // загружаем проекты и галерею параллельно
                const [projectsRes, galleryRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/gallery/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                setProjects(projectsRes.data || []);

                const gallery = galleryRes.data;
                // 👇 важно: приводим project_id к строке
                setData({
                    image: gallery.image || '',
                    project_id: gallery.project_id ? String(gallery.project_id) : ''
                });

            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('project_id', data.project_id);
            if (imageFile) formData.append('image', imageFile);

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/gallery/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            router.push(`/admin/gallery/view-gallery/${id}`);
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
        }
    };

    if (loading) return <p className="p-6">Загрузка...</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Gallery</h1>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {/* текущая картинка */}
                        {data.image && !previewURL && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                                    alt="Gallery Image"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}

                        <div className="mb-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                            <div className="w-full">
                                <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setImageFile(file);
                                            setPreviewURL(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div className="w-full">
                                <label htmlFor="project" className="block font-semibold mb-2">Project:</label>
                                <select
                                    id="project"
                                    value={data.project_id}
                                    onChange={(e) => setData(prev => ({ ...prev, project_id: e.target.value }))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={String(p.id)}>
                                            {p.en || p.tk || p.ru || `Project ${p.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {previewURL && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Preview of New Image:</label>
                                <Image
                                    src={previewURL}
                                    alt="Preview"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="w-5 h-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGallery;
