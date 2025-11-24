'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface Project {
    id: number;
    image: string;
    logo: string;
    tk: string;
    en: string;
    ru: string;
    text_tk: string;
    text_en: string;
    text_ru: string;
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
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

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProjects(response.data);
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
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Projects</h2>
                        <Link
                            href="/admin/projects/add-project"
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
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Logo</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Title</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No projects available</td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${project.image}`}
                                            alt={`Project ${project.id}`}
                                            width={100}
                                            height={100}
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${project.logo}`}
                                            alt={`Project ${project.id}`}
                                            width={100}
                                            height={100}
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: project.en }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/projects/view-project/${project.id}`}
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

export default Projects;
