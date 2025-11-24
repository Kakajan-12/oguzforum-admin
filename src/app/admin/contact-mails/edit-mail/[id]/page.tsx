'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditMail = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ mail: '', location_id: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_en: string}[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;
                    setData({
                        ...rawData,
                    });

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            const formData = new FormData();
            formData.append("mail", data.mail);
            formData.append("location_id", String(data.location_id));

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`,
                {
                    mail: data.mail,
                    location_id: Number(data.location_id)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );


            router.push(`/admin/contact-mails/`);
        } catch (err) {
            console.error(err);
            setError("Ошибка при сохранении");
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
                    <h1 className="text-2xl font-bold mb-4">Edit Mail</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label className="block font-semibold mb-2">Mail:</label>
                                <input
                                    id="mail"
                                    name="mail"
                                    value={data.mail}
                                    onChange={(e) => setData((prev) => ({...prev, mail: e.target.value}))}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Location:
                                </label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={String(data.location_id)}
                                    onChange={(e) => setData((prev) => ({...prev, location_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select location</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={String(location.id)}>
                                            {location.location_en}
                                        </option>
                                    ))}
                                </select>
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

export default EditMail;
