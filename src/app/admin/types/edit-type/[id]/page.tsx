'use client';
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

type Data = {
    type_tk: string;
    type_en: string;
    type_ru: string;
};

const EditTypes = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [data, setData] = useState<Data>({
        type_tk: '',
        type_en: '',
        type_ru: '',
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get<Data[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/types/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const type = response.data[0]; // If API returns array
                setData({
                    type_tk: type.type_tk || '',
                    type_en: type.type_en || '',
                    type_ru: type.type_ru || '',
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
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/types/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/types');
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
                    <h1 className="text-2xl font-bold mb-6">Edit Types</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Turkmen:</label>
                            <input
                                name="type_tk"
                                value={data.type_tk}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">English:</label>
                            <input
                                name="type_en"
                                value={data.type_en}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Russian:</label>
                            <input
                                name="type_ru"
                                value={data.type_ru}
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

export default EditTypes;
