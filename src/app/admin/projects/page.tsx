'use client';
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PencilSquareIcon, PlusIcon, PhotoIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface Project {
    id: number;
    image: string;
    logo: string;
    en: string;
    text_en: string;
}

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]*>?/gm, "").trim();
const mediaUrl = (p?: string) =>
    p ? `${process.env.NEXT_PUBLIC_API_URL}/${p.replace(/\\/g, "/")}` : "";

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

    // Newest first — highest (most recently added) id on top.
    const sorted = useMemo(
        () => [...projects].sort((a, b) => b.id - a.id),
        [projects]
    );

    if (error) {
        return (
            <div className="admin-page flex">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer />

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {sorted.length} project{sorted.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <Link href="/admin/projects/add-project" className="admin-btn whitespace-nowrap">
                        <PlusIcon className="size-5" /> Add
                    </Link>
                </div>

                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">ID</th>
                                <th className="px-5 py-3">Image</th>
                                <th className="px-5 py-3">Logo</th>
                                <th className="px-5 py-3">Title</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {sorted.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                                        No projects available
                                    </td>
                                </tr>
                            ) : (
                                sorted.map((project) => (
                                    <tr key={project.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs font-medium text-gray-500">#{project.id}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {project.image ? (
                                                <Image
                                                    src={mediaUrl(project.image)}
                                                    alt={`Project ${project.id}`}
                                                    width={72}
                                                    height={48}
                                                    className="h-12 w-[72px] rounded-md border border-gray-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-[72px] flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-[10px] font-medium text-gray-400">
                                                    <PhotoIcon className="size-4" />
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {project.logo ? (
                                                <Image
                                                    src={mediaUrl(project.logo)}
                                                    alt={`Logo ${project.id}`}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 rounded-md border border-gray-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-[9px] font-medium text-gray-400">
                                                    <PhotoIcon className="size-4" />
                                                    No logo
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="line-clamp-2 max-w-xl font-medium text-gray-800">
                                                {stripHtml(project.en)}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/projects/view-project/${project.id}`}
                                                    className="admin-btn-ghost"
                                                    title="View"
                                                >
                                                    <EyeIcon className="size-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/projects/edit-project/${project.id}`}
                                                    className="admin-btn-ghost"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="size-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
