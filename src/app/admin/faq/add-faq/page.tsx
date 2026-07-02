'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTap from '@/Components/TipTapEditor';

const AddFaq = () => {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [en, setTitleEn] = useState('');
    const [text_en, setTextEn] = useState('');


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

        const body = {
            en,
            text_en,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faq`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                await response.json();
                setTitleEn('');
                setTextEn('');
                router.push('/admin/faq');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении FAQ:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add FAQ</h2>

                        {isClient && (
                            <div className="bg-base-100 border border-gray-200 rounded-md p-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Question:</label>
                                    <input
                                        value={en}
                                        onChange={(e) => setTitleEn(e.target.value)}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Answer:</label>
                                    <TipTap content={text_en} onChange={setTextEn} />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="mt-6 w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add FAQ
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddFaq;
