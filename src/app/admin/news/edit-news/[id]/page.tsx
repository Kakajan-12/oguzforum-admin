'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTap from '@/Components/TipTapEditor';
import GalleryPicker from '@/Components/GalleryPicker';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditNews = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ en: '', text_en: '', image: '', date: '', news_cat_id: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<{ id: number; image: string }[]>([]);
    const [newGallery, setNewGallery] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<{ id: number, cat_en: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news-cat`);
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    // Форматируем дату для input[type="date"]
                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        date: formattedDate,
                    });
                    setGalleryImages(rawData.images || []);

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
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
            formData.append("en", data.en);
            formData.append("text_en", data.text_en);
            formData.append("news_cat_id", String(data.news_cat_id));
            formData.append("date", data.date);

            // если новое изображение выбрано → добавляем
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // новые изображения галереи (дозаписываются к существующим)
            newGallery.forEach((f) => formData.append("gallery", f));

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            router.push(`/admin/news/view-news/${id}`);
        } catch (err) {
            console.error(err);
            setError("Ошибка при сохранении");
        }
    };

    const deleteGalleryImage = async (imageId: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/news/image/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error('Ошибка при удалении изображения:', err);
        }
    };


    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit News</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                    alt="News"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}
                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <div className="mb-4">
                                    <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Date:
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
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    News Category:
                                </label>
                                <select
                                    id="news_cat"
                                    name="news_cat"
                                    value={String(data.news_cat_id)}
                                    onChange={(e) => setData((prev) => ({ ...prev, news_cat_id: e.target.value }))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={String(cat.id)}>
                                            {cat.cat_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Title:</label>
                                <TipTap
                                    content={data.en}
                                    onChange={(content) => handleEditorChange('en', content)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Text:</label>
                                <TipTap
                                    content={data.text_en}
                                    onChange={(content) => handleEditorChange('text_en', content)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block font-semibold">Gallery:</label>
                            {galleryImages.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {galleryImages.map((img) => (
                                        <div key={img.id} className="relative">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${img.image.replace('\\', '/')}`}
                                                alt="Gallery"
                                                width={128}
                                                height={96}
                                                className="h-24 w-32 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => deleteGalleryImage(img.id)}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white hover:bg-red-700"
                                                aria-label="Delete image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No gallery images yet.</p>
                            )}
                            <GalleryPicker
                                files={newGallery}
                                onChange={setNewGallery}
                                label="Add gallery images"
                            />
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

export default EditNews;
