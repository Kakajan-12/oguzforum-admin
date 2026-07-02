'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTap from '@/Components/TipTapEditor';

const AddCareer = () => {
    const [isClient, setIsClient] = useState(false);
    const [en, setTitleEn] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [location, setLocation] = useState('');

    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(getTodayDate());

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

        const careerData = {
            en: en ?? '',
            description: description ?? '',
            requirements: requirements ?? '',
            job_type: jobType ?? '',
            location: location ?? '',
            date: date ?? '',
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(careerData),
            });

            if (response.ok) {
                router.push('/admin/career');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add vacancy</h2>

                        <div className="mb-4 space-y-4">
                            <div className="w-fit">
                                <label className="block text-gray-700 font-semibold mb-2">Date:</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                <input
                                    value={en}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Type:</label>
                                    <input
                                        value={jobType}
                                        onChange={(e) => setJobType(e.target.value)}
                                        type="text"
                                        placeholder="Full-time"
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Location:</label>
                                    <input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        type="text"
                                        placeholder="Ashgabat, Turkmenistan"
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            {isClient && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Description:</label>
                                    <TipTap content={description} onChange={setDescription}/>
                                </div>
                            )}

                            {isClient && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Requirements (use a bullet list):
                                    </label>
                                    <TipTap content={requirements} onChange={setRequirements}/>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add vacancy
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCareer;
