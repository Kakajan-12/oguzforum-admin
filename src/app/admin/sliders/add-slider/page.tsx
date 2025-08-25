'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import { Editor } from '@tinymce/tinymce-react';

const AddSlider = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [tk, setTitleTk] = useState('');
    const [en, setTitleEn] = useState('');
    const [ru, setTitleRu] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('tk', tk ?? '');
        formData.append('en', en ?? '');
        formData.append('ru', ru ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');

                router.push('/admin/sliders');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении слайда:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    const editorConfig = {
        height: 200,
        menubar: false,
        plugins: ['lists link image editimage table code'],
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image code',
        content_css: '//www.tiny.cloud/css/codepen.min.css',
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form onSubmit={handleSubmit} className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new slide</h2>

                        <div className="mb-4">
                            <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                Image:
                            </label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                    }
                                }}
                                required
                                className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                            />
                        </div>

                        {isClient && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Title Tk:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        init={editorConfig}
                                        value={tk}
                                        onEditorChange={(content) => setTitleTk(content)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Title En:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        init={editorConfig}
                                        value={en}
                                        onEditorChange={(content) => setTitleEn(content)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Title Ru:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        init={editorConfig}
                                        value={ru}
                                        onEditorChange={(content) => setTitleRu(content)}
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150">
                            Add slider
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSlider;
