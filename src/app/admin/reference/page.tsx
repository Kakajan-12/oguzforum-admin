'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PlusCircleIcon} from "@heroicons/react/16/solid";
import { FaFilePdf } from "react-icons/fa";

interface References {
    id: number;
    file: string;
    name_tk: string;
    name_en: string;
    name_ru: string;
}

const Reference = () => {
    const [references, setReferences] = useState<References[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/references/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setReferences(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchProjects();
    }, [router]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Reference</h2>
                        <Link
                            href="/admin/reference/add-reference"
                            className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"
                        >
                            <PlusCircleIcon className="size-6" color="#ffffff"/>
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>

                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">File</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Turkmen</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">English</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Russian</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {references.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No references available</td>
                            </tr>
                        ) : (
                            references.map((reference) => (
                                <tr key={reference.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <FaFilePdf className="text-blue-950" size={40} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div>{reference.name_tk}</div>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div>{reference.name_en}</div>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                       <div>{reference.name_ru}</div>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/reference/view-reference/${reference.id}`}
                                            className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"
                                        >
                                            <EyeIcon color="#ffffff"/>
                                            <div className="ml-2">View</div>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Reference