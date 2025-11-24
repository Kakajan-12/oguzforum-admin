'use client'
import {FormEvent, useState} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";


const AddReference=()=>{
    const [file, setFile] = useState<File | null>(null);
    const [name_tk, setNameTk] = useState('');
    const [name_en, setNameEn] = useState('');
    const [name_ru, setNameRu] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (loading) return;

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('name_tk', name_tk);
        formData.append('name_en', name_en);
        formData.append('name_ru', name_ru);
        formData.append('date', date);

        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/references`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                console.log('data добавлен!');
                router.push('/admin/reference');
            } else {
                const error = await res.text();
                console.error('Ошибка при добавлении:', error);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add New Reference</h2>

                        <div className="mb-4 flex flex-col space-y-2">
                            <div className="flex space-x-4">
                                <div className="w-1/3">
                                    <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                        File:
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Date:
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <div className="w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Turkmen:
                                    </label>
                                    <input
                                        type="text"
                                        id="name_tk"
                                        name="name_tk"
                                        value={name_tk}
                                        onChange={(e) => setNameTk(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        English:
                                    </label>
                                    <input
                                        type="text"
                                        id="name_en"
                                        name="name_en"
                                        value={name_en}
                                        onChange={(e) => setNameEn(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Russian:
                                    </label>
                                    <input
                                        type="text"
                                        id="name_ru"
                                        name="name_ru"
                                        value={name_ru}
                                        onChange={(e) => setNameRu(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Reference'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddReference;