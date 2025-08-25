'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface ServiceData {
    tk: string;
    text_tk: string;
    en: string;
    text_en: string;
    ru: string;
    text_ru: string;
    image: string;
}

const EditService = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<ServiceData>({
        tk: '',
        text_tk: '',
        en: '',
        text_en: '',
        ru: '',
        text_ru: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Ответ от сервера:", response.data);

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0]; // Получаем первый элемент массива

                    setData({
                        tk: rawData.tk,
                        text_tk: rawData.text_tk,
                        en: rawData.en,
                        text_en: rawData.text_en,
                        ru: rawData.ru,
                        text_ru: rawData.text_ru,
                        image: rawData.image,
                    });
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

    // Update the type of 'name' to match the keys of the 'data' object
    const handleEditorChange = (name: keyof ServiceData, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('No auth token found');
                return;
            }

            const formData = new FormData();
            formData.append('tk', data.tk);
            formData.append('text_tk', data.text_tk);
            formData.append('en', data.en);
            formData.append('text_en', data.text_en);
            formData.append('ru', data.ru);
            formData.append('text_ru', data.text_ru);

            // если новое изображение выбрано
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push(`/admin/services/view-service/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
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
                    <h1 className="text-2xl font-bold mb-4">Edit Service</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                    alt="Service"
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
                        </div>

                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.tk}
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
                                        value={data.text_tk}
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

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English" />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.en}
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
                                        value={data.text_en}
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

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian" />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.ru}
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
                                        value={data.text_ru}
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
                            <DocumentIcon className="size-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditService;
