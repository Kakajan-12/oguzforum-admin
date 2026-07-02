'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const ContactLocation = () => {
    const [isClient, setIsClient] = useState(false);
    const [address_en, setAddressEn] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [iframe_code, setIframe] = useState('')
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

        const payload = {
            address_en,
            location_en,
            iframe_code,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(' добавлены!', data);
                setAddressEn('');
                setLocationEn('');
                setIframe('')
                router.push('/admin/contact-address');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении проекта:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4">Add contact locations</h2>

                        <div className="mb-5">
                            <label className="block text-gray-700 font-semibold mb-2">Add location iframe code</label>
                            <textarea
                                value={iframe_code}
                                onChange={(e) => setIframe(e.target.value)}
                                className="border border-gray-300 rounded p-2 w-full h-44"
                            >
                            </textarea>

                        </div>

                        {isClient && (
                            <div className="bg-base-100 border border-gray-200 rounded-md p-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Location:</label>
                                    <input
                                        value={location_en}
                                        onChange={(e) => setLocationEn(e.target.value)}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Location Address:</label>
                                    <input
                                        value={address_en}
                                        onChange={(e) => setAddressEn(e.target.value)}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add location
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactLocation;
