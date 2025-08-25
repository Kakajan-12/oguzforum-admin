'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditFaq = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        tk: '', text_tk: '',
        en: '', text_en: '',
        ru: '', text_ru: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/faq/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const raw = response.data[0];
                if (raw) {
                    setData({
                        tk: raw.tk || '',
                        text_tk: raw.text_tk || '',
                        en: raw.en || '',
                        text_en: raw.text_en || '',
                        ru: raw.ru || '',
                        text_ru: raw.text_ru || '',
                    });
                } else {
                    setError('Данные не найдены');
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/faq/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            router.push(`/admin/faq/view-faq/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const renderEditorBlock = (lang: string, questionField: keyof typeof data, answerField: keyof typeof data) => (
        <div className="tab-content bg-base-100 border-base-300 p-6">
            <div className="mb-4">
                <label className="block font-semibold mb-2">Question ({lang}):</label>
                <input
                    value={data[questionField]}
                    onChange={(e) => handleChange(questionField, e.target.value)}
                    type="text"
                    required
                    className="border border-gray-300 rounded p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block font-semibold mb-2">Answer ({lang}):</label>
                <Editor
                    key={`${answerField}-editor`}
                    apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                    value={data[answerField]}
                    onEditorChange={(content) => handleChange(answerField, content)}
                    init={{
                        height: 200,
                        menubar: false,
                        plugins: 'link image code lists',
                        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit FAQ</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="tabs tabs-lift">
                            <input type="radio" name="faq_tabs" className="tab" aria-label="Turkmen" defaultChecked />
                            {renderEditorBlock('Turkmen', 'tk', 'text_tk')}

                            <input type="radio" name="faq_tabs" className="tab" aria-label="English" />
                            {renderEditorBlock('English', 'en', 'text_en')}

                            <input type="radio" name="faq_tabs" className="tab" aria-label="Russian" />
                            {renderEditorBlock('Russian', 'ru', 'text_ru')}
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

export default EditFaq;
