'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddMails = () => {
    const [mail, setMail] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setSetLocations] = useState<
        { id: number; location_en: string; }[]
    >([]);


    const router = useRouter();

    useEffect(() => {

        const fetchAddresses = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setSetLocations(data);
                } else {
                    console.error('Неверный формат данных:', data);
                }
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };


        fetchAddresses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mail,
                    location_id: locationId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setMail('');
                setLocationId('');
                router.push('/admin/contact-mails');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
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
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new mail</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Mail:</label>
                                <input
                                    value={mail}
                                    onChange={(e) => setMail(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Locations:
                                </label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select location</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.location_en}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add mail
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMails;
