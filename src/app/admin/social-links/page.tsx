'use client';

import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import {
    TrashIcon,
    PencilSquareIcon,
    PlusIcon,
    LinkIcon,
} from "@heroicons/react/16/solid";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TikTokIcon from '@mui/icons-material/MusicNote'; // Заменитель для TikTok

interface LinkType {
    id: number;
    icon: string;
    url: string;
}

const SocialLinks = () => {
    const [links, setLinks] = useState<LinkType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const router = useRouter();

    const getIconComponent = (iconName: string) => {
        switch (iconName.toLowerCase()) {
            case 'facebook':
                return <FacebookIcon />;
            case 'instagram':
                return <InstagramIcon />;
            case 'twitter':
                return <TwitterIcon />;
            case 'linkedin':
                return <LinkedInIcon />;
            case 'telegram':
                return <TelegramIcon />;
            case 'whatsapp':
                return <WhatsAppIcon />;
            case 'tiktok':
                return <TikTokIcon />;
            default:
                return <span>❓</span>;
        }
    };

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLinks(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');
                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, [router]);


    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLinks(prev => prev.filter(link => link.id !== deleteId));
            setDeleteId(null);
            setShowModal(false);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setError('Ошибка при удалении ссылки');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10 text-gray-500">Loading...</div>
        </div>
    );
    if (error) return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10 text-red-600">{error}</div>
        </div>
    );

    return (
        <div className="admin-page flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer />

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {links.length} link{links.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <Link href="/admin/social-links/add-link" className="admin-btn whitespace-nowrap">
                        <PlusIcon className="size-5" /> Add
                    </Link>
                </div>

                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">Icon</th>
                                <th className="px-5 py-3">URL</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {links.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                                        No social links yet
                                    </td>
                                </tr>
                            ) : (
                                links.map((link) => (
                                    <tr key={link.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1268B3]/10 text-[#1268B3]">
                                                    {getIconComponent(link.icon)}
                                                </span>
                                                <span className="font-medium capitalize text-gray-800">{link.icon}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex max-w-md items-center gap-1.5 truncate text-[#1268B3] hover:underline"
                                            >
                                                <LinkIcon className="size-4 shrink-0 text-gray-400" />
                                                <span className="truncate">{link.url}</span>
                                            </a>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/social-links/edit-link/${link.id}`}
                                                    className="admin-btn-ghost"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="size-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(link.id);
                                                        setShowModal(true);
                                                    }}
                                                    className="admin-btn-danger"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => !isDeleting && setShowModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <TrashIcon className="size-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Delete link</h2>
                        </div>
                        <p className="mb-6 text-sm text-gray-500">
                            Are you sure you want to delete this social link? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteId(null);
                                    setShowModal(false);
                                }}
                                className="admin-btn-ghost"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialLinks;
