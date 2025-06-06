'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditCookie = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ tk: '', en: '', ru: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/privacy/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.length > 0) {
                    const rawData = response.data[0];

                    setData({
                        tk: rawData.tk || '',
                        en: rawData.en || '',
                        ru: rawData.ru || '',
                    });

                    setLoading(false);
                } else {
                    throw new Error('Данные не найдены');
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

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/privacy/${id}`,
                { ...data },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push("/admin/privacy");
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
                    <h1 className="text-2xl font-bold mb-4">Edit Privacy Policy</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
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
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
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
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
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

export default EditCookie;
