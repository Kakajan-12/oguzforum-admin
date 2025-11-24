'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/16/solid";

type AppliedItem = {
    id: number;
    name: string;
    surname: string;
    email: string;
    number: string;
};

const Applied = () => {
    const [applied, setApplied] = useState<AppliedItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchApplied = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/apply-job`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setApplied(response.data);
            } catch (err) {
                console.error(err);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchApplied();
    }, [router]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Applied</h2>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Name</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Surname</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Email</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Number</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {applied.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">No applicants available</td>
                            </tr>
                        ) : (
                            applied.map(data => (
                                <tr key={data.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">{data.name}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">{data.surname}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">{data.email}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">{data.number}</td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link href={`/admin/applied/view-applied/${data.id}`} className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32">
                                            <EyeIcon color="#ffffff" />
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

export default Applied;
