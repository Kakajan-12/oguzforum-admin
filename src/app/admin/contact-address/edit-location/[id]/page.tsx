'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditLocationAddress = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ tk: '', en: '', ru: '', location_tk: '', location_en: '', location_ru: '', iframe_code: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0];
                    setData({ ...rawData });
                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены");
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`,
                { ...data },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push(`/admin/contact-address/view-location/${id}`);
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
                    <h1 className="text-2xl font-bold mb-4">Edit Contact Location</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="mb-5">
                            <label className="block text-gray-700 font-semibold mb-2">Change location iframe code</label>
                            <input
                                name="iframe_code"
                                type="text"
                                value={data.iframe_code}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />

                        </div>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Location</label>
                                    <input
                                        name="tk"
                                        value={data.tk}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />

                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address Location:</label>
                                    <input
                                        name="location_tk"
                                        value={data.location_tk}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Location:</label>
                                    <input
                                        name="en"
                                        value={data.en}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address Location:</label>
                                    <input
                                        name="location_en"
                                        value={data.location_en}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Location:</label>
                                    <input
                                        name="ru"
                                        value={data.ru}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address Location:</label>
                                    <input
                                        name="location_ru"
                                        value={data.location_ru}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
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

export default EditLocationAddress;
