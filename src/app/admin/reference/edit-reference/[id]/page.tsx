'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";

const EditReference = () => {
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        file: '',
        name_tk: '',
        name_en: '',
        name_ru: '',
        date:"",
    });

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfPath, setPdfPath] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/references/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        date: formattedDate,
                    });

                    setPdfPath(rawData.file);

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены");
                }

            } catch (err) {
                console.error('Ошибка при загрузке:', err);
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
            if (!token) throw new Error("Нет токена");

            const formData = new FormData();

            formData.append("name_tk", data.name_tk);
            formData.append("name_en", data.name_en);
            formData.append("name_ru", data.name_ru);
            formData.append("date", data.date);

            if (pdfFile) {
                formData.append("file", pdfFile);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/references/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            router.push(`/admin/reference/view-reference/${id}`);
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            setError("Ошибка при сохранении");
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Reference</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {pdfPath && (
                            <div>
                                <label className="block font-semibold mb-2">Current file:</label>
                                <iframe
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.file}`}
                                    className="w-full h-96 border"
                                />
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block font-semibold mb-2">New file:</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                                    className="border rounded p-2 w-full"
                                />
                            </div>
                        </div>


                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Date:
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={data.date}
                                    onChange={(e) => setData((prev) => ({...prev, date: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Turkmen</label>
                                <input
                                    type="text"
                                    id="name_tk"
                                    name="name_tk"
                                    value={data.name_tk || ''}
                                    onChange={(e) => setData((prev) => ({...prev, name_tk: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">English</label>
                                <input
                                    type="text"
                                    id="name_en"
                                    name="name_en"
                                    value={data.name_en || ''}
                                    onChange={(e) => setData((prev) => ({...prev, name_en: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Russian</label>
                                <input
                                    type="text"
                                    id="name_ru"
                                    name="name_ru"
                                    value={data.name_ru || ''}
                                    onChange={(e) => setData((prev) => ({...prev, name_ru: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
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

export default EditReference;
