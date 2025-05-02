'use client';
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

type LocationData = {
    location_tk: string;
    location_en: string;
    location_ru: string;
};

const EditLocation = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [data, setData] = useState<LocationData>({
        location_tk: '',
        location_en: '',
        location_ru: '',
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get<LocationData[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/locations/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const location = response.data[0]; // If API returns array
                setData({
                    location_tk: location.location_tk || '',
                    location_en: location.location_en || '',
                    location_ru: location.location_ru || '',
                });
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error('Ошибка при загрузке данных:', axiosError);
                setError('Ошибка при загрузке');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/locations/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/locations');
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error('Ошибка при сохранении:', axiosError);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p className="p-4">Загрузка...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-6">Edit Location</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Turkmen:</label>
                            <input
                                name="location_tk"
                                value={data.location_tk}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">English:</label>
                            <input
                                name="location_en"
                                value={data.location_en}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Russian:</label>
                            <input
                                name="location_ru"
                                value={data.location_ru}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
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

export default EditLocation;
