'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface PartnerData {
    id?: number;
    logo?: string;
    image?: string;
}

const EditPartner = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<PartnerData>({ logo: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const partnerData = Array.isArray(response.data)
                    ? response.data[0]
                    : response.data;

                if (partnerData && partnerData.id) {
                    // правильно обновляем состояние
                    setData(partnerData);
                } else {
                    throw new Error("Партнёр не найден");
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке данных');
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

            if (imageFile) {
                formData.append('logo', imageFile); // новый файл
            } else if (data.logo) {
                formData.append('logo', data.logo); // старое значение
            } else {
                throw new Error('Нет логотипа для отправки');
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/partners/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push('/admin/partners');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setError('Ошибка при сохранении');
        }
    };



    if (loading) return <p className="p-4">Загрузка...</p>;
    if (error) return <p className="p-4 text-red-600">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Partner Logo</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.logo && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.logo.replace(/\\/g, '/')}`}
                                    alt="Current Logo"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded border"
                                    onError={() => console.log('Ошибка загрузки изображения')}
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="logo" className="block font-semibold mb-2">New image:</label>
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

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

export default EditPartner;
