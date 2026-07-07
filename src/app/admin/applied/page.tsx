'use client'
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/16/solid";

type AppliedItem = {
    id: number;
    name: string;
    surname: string;
    email: string;
    number: string;
};

const Applied = () => {
    const [applied, setApplied] = useState<AppliedItem[]>([]);
    const [search, setSearch] = useState("");
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

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const base = q
            ? applied.filter((a) =>
                `${a.name} ${a.surname} ${a.email}`.toLowerCase().includes(q))
            : applied;
        // Newest applications first.
        return [...base].sort((a, b) => b.id - a.id);
    }, [applied, search]);

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
                        <h1 className="text-2xl font-bold text-gray-900">Applied</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {filtered.length} applicant{filtered.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search applicants"
                            className="admin-input !w-64 !pl-9"
                        />
                    </div>
                </div>

                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">Applicant</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Phone</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No applicants found</td></tr>
                            ) : (
                                filtered.map((data) => (
                                    <tr key={data.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1268B3]/10 text-sm font-bold uppercase text-[#1268B3]">
                                                    {(data.name || "?").charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {data.name} {data.surname}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#1268B3]">
                                                <EnvelopeIcon className="size-4 text-gray-400" />
                                                {data.email}
                                            </a>
                                        </td>
                                        <td className="px-5 py-3">
                                            <a href={`tel:${data.number}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#1268B3]">
                                                <PhoneIcon className="size-4 text-gray-400" />
                                                {data.number}
                                            </a>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end">
                                                <Link href={`/admin/applied/view-applied/${data.id}`} className="admin-btn-ghost" title="View">
                                                    <EyeIcon className="size-4" /> View
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
    )
}

export default Applied;
