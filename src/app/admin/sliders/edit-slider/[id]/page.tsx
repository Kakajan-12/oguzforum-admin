'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface SliderData {
    tk: string;
    en: string;
    ru: string;
    image: string;
}

const EditSlider = () => {
    const { id } = useParams();
    const router = useRouter();

    const [slider, setSlider] = useState<SliderData>({ tk: '', en: '', ru: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSlider(response.data[0]); // сервер возвращает массив
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error loading slider');
                setLoading(false);
            }
        };

        if (id) fetchSlider();
    }, [id]);

    const handleEditorChange = (name: keyof SliderData, content: string) => {
        setSlider((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('No auth token found');
                return;
            }

            const formData = new FormData();
            formData.append('tk', slider.tk);
            formData.append('en', slider.en);
            formData.append('ru', slider.ru);

            // если новое изображение выбрано
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push(`/admin/sliders/view-slider/${id}`);
        } catch (err) {
            console.error(err);
            setError('Error saving slider');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Slider</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {slider.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current Image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace(/\\/g, '/')}`}
                                    alt="Slider"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="image" className="block font-semibold mb-2">New Image:</label>
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

                        <div>
                            <label className="block font-semibold mb-2">Turkmen</label>
                            <Editor
                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                value={slider.tk}
                                onEditorChange={(content) => handleEditorChange('tk', content)}
                                init={{
                                    height: 200,
                                    menubar: false,
                                    plugins: 'link image code lists',
                                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                }}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">English</label>
                            <Editor
                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                value={slider.en}
                                onEditorChange={(content) => handleEditorChange('en', content)}
                                init={{
                                    height: 200,
                                    menubar: false,
                                    plugins: 'link image code lists',
                                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                }}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Russian</label>
                            <Editor
                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                value={slider.ru}
                                onEditorChange={(content) => handleEditorChange('ru', content)}
                                init={{
                                    height: 200,
                                    menubar: false,
                                    plugins: 'link image code lists',
                                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                }}
                            />
                        </div>

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

export default EditSlider;
