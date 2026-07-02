'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

type FaqItem = {
    id: number;
    en: string;
};

const Faq = () => {
    const [faq, setFaq] = useState<FaqItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/faq`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setFaq(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError('Ошибка при получении данных');
                    if (err.response?.status === 401) {
                        router.push('/');
                    }
                } else {
                    setError('Неизвестная ошибка');
                }
            }
        };

        fetchFaq();
    }, [router]);

    if (error) {
        return <div className="p-10 text-red-600">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
                        <Link
                            href="/admin/faq/add-faq"
                            className="bg text-white py-2 px-6 rounded-md flex items-center hover:bg-blue-700 transition"
                        >
                            <PlusCircleIcon className="size-5 mr-2" />
                            Add
                        </Link>
                    </div>

                    {faq.length === 0 ? (
                        <p className="mt-4 text-gray-600">FAQ не найдено.</p>
                    ) : (
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg mt-4">
                            <thead>
                            <tr>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Question</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                            </tr>
                            </thead>
                            <tbody>
                            {faq.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: item.en }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/faq/view-faq/${item.id}`}
                                            className="bg text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-blue-700 transition w-fit"
                                        >
                                            <EyeIcon className="size-5 mr-2" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Faq;
