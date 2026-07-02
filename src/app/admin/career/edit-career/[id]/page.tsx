'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import TipTap from '@/Components/TipTapEditor';

const EditCareer = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        en: '',
        description: '',
        requirements: '',
        job_type: '',
        location: '',
        date: '',
    });

    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/career/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data && response.data.length > 0) {
                    const rawData = response.data[0];
                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        en: rawData.en || '',
                        description: rawData.description || '',
                        requirements: rawData.requirements || '',
                        job_type: rawData.job_type || '',
                        location: rawData.location || '',
                        date: formattedDate,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const setField = (name: string, value: string) => {
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/career/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            router.push('/admin/career');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p className="p-6">Загрузка...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit vacancy</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                            <input
                                name="en"
                                value={data.en}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="w-fit">
                            <label className="block text-gray-700 font-semibold mb-2">Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={data.date}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Type:</label>
                                <input
                                    name="job_type"
                                    value={data.job_type}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Full-time"
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Location:</label>
                                <input
                                    name="location"
                                    value={data.location}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Ashgabat, Turkmenistan"
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>

                        {isClient && (
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Description:</label>
                                <TipTap content={data.description} onChange={(c: string) => setField('description', c)} />
                            </div>
                        )}

                        {isClient && (
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Requirements (use a bullet list):
                                </label>
                                <TipTap content={data.requirements} onChange={(c: string) => setField('requirements', c)} />
                            </div>
                        )}

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

export default EditCareer;
