'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios"; // Import AxiosError
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface Service {
    id: number;
    image: string;
    tk: string;
    en: string;
    ru: string;
}

const Services = () => {
    const [services, setServices] = useState<Service[]>([]); // Type the state with Service[]
    const [error, setError] = useState<string | null>(null); // Error state
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setServices(response.data); // Assuming the response data is an array of services
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchServices();
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
                        <h2 className="text-2xl font-bold mb-4">Services</h2>
                        <Link
                            href="/admin/services/add-service"
                            className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"
                        >
                            <PlusCircleIcon className="size-6" color="#ffffff" />
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Image</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Turkmen</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">English</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Russian</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {services.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No sliders available</td>
                            </tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${service.image}`}
                                            alt={`Service ${service.id}`}
                                            width={100}
                                            height={100}
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: service.tk }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: service.en }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: service.ru }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/services/view-service/${service.id}`}
                                            className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"
                                        >
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
    );
};

export default Services;
