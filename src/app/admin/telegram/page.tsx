"use client";

import React, {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {FaTelegramPlane} from "react-icons/fa";
import {
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/16/solid";

interface TelegramAdmin {
    id: number;
    username: string;
    full_name: string;
    created_at: string;
}

interface ApiResponse {
    success?: boolean;
    error?: string;
    message?: string;
}

export default function AdminTelegramPanel() {
    const [admins, setAdmins] = useState<TelegramAdmin[]>([]);
    const [newAdmin, setNewAdmin] = useState({username: "", fullName: ""});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    // 🔧 Единая функция для получения токена
    const getAuthToken = useCallback(() => {
        // Проверяем оба варианта на всякий случай
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (!token) {
            console.error("No auth token found in localStorage");
            router.push("/");
            return null;
        }
        return token;
    }, [router]);

    const loadAdmins = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                console.error("Token invalid or expired");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("token");
                router.push("/");
                return;
            }

            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            console.error("Error loading admins:", error);
        }
    }, [getAuthToken, router]);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const addAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.username.trim()) return;

        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAdmin)
            });

            // 🔧 Детальный лог ответа
            console.log("Add admin response status:", response.status);
            const result: ApiResponse = await response.json();
            console.log("Add admin response:", result);

            if (response.ok && result.success) {
                setMessage(`✅ Admin ${newAdmin.username} added successfully`);
                setNewAdmin({username: "", fullName: ""});
                loadAdmins();

                // Автоматически скрываем сообщение через 3 секунды
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`❌ Error: ${result.error || result.message || "Unknown error"}`);
            }
        } catch (error: unknown) {
            console.error("Add admin error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setMessage(`❌ Network error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const removeAdmin = async (username: string) => {
        if (!confirm(`Remove admin @${username}?`)) return;

        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({username})
            });

            console.log("Remove admin response status:", response.status);
            const result: ApiResponse = await response.json();
            console.log("Remove admin response:", result);

            if (response.ok && result.success) {
                setMessage(`✅ Admin @${username} removed successfully`);
                loadAdmins();

                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`❌ Error: ${result.error || "Failed to remove admin"}`);
            }
        } catch (error: unknown) {
            console.error("Remove admin error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setMessage(`❌ Network error: ${errorMessage}`);
        }
    };

    // 🔧 Функция для проверки токена
    const checkTokenValidity = useCallback(() => {
        const token = getAuthToken();
        if (!token) return false;

        // Простая проверка формата токена
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error("Invalid token format");
                return false;
            }

            // Можно добавить проверку истечения срока
            const payload = JSON.parse(atob(parts[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();

            if (isExpired) {
                console.error("Token expired");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("token");
                router.push("/");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Token parsing error:", error);
            return false;
        }
    }, [getAuthToken, router]);

    useEffect(() => {
        // Проверяем токен при загрузке компонента
        if (!checkTokenValidity()) {
            router.push("/");
        }
    }, [checkTokenValidity, router]);

    const isSuccess = message.includes("✅");
    const isError = message.includes("❌");
    const cleanMessage = message.replace(/[✅❌]/g, "").trim();

    return (
        <div className="admin-page flex">
            <Sidebar/>
            <div className="ml-64 flex-1 p-8 lg:p-10">
                <TokenTimer/>

                {/* Header */}
                <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/10 text-[#229ED9]">
                        <FaTelegramPlane className="size-6"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Telegram Bot Admins</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Telegram accounts allowed to answer visitors in the site chat via the bot.
                        </p>
                    </div>
                </div>

                {/* Toast */}
                {message && (
                    <div
                        className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                            isSuccess
                                ? "border-green-200 bg-green-50 text-green-700"
                                : isError
                                    ? "border-red-200 bg-red-50 text-red-600"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircleIcon className="size-5 shrink-0"/>
                        ) : isError ? (
                            <ExclamationCircleIcon className="size-5 shrink-0"/>
                        ) : null}
                        {cleanMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Add admin */}
                    <div className="lg:col-span-1">
                        <form onSubmit={addAdmin} className="admin-card p-6">
                            <h2 className="mb-1 text-lg font-semibold text-gray-900">Add a new admin</h2>
                            <p className="mb-5 text-sm text-gray-500">Grant a Telegram account bot access.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="admin-label">Username <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                        <input
                                            type="text"
                                            value={newAdmin.username}
                                            onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                                            placeholder="username"
                                            className="admin-input !pl-7"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Telegram username without @</p>
                                </div>

                                <div>
                                    <label className="admin-label">Full name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.fullName}
                                        onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})}
                                        placeholder="Name Surname"
                                        className="admin-input"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Optional: admin&apos;s full name</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !newAdmin.username.trim()}
                                    className="admin-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <PlusIcon className="size-5"/>
                                    {loading ? "Adding..." : "Add admin"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Admin list */}
                    <div className="lg:col-span-2">
                        <div className="admin-card p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Current admins</h2>
                                <span className="inline-flex items-center rounded-full bg-[#1268B3]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1268B3]">
                                    {admins.length}
                                </span>
                            </div>

                            {admins.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                                    <FaTelegramPlane className="mx-auto mb-2 size-8 text-gray-300"/>
                                    <p className="text-sm text-gray-400">There are no registered admins yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {admins.map((admin, index) => (
                                        <div
                                            key={`${admin.username}-${index}`}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-sm font-bold uppercase text-[#229ED9]">
                                                    {(admin.full_name || admin.username || "?").charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-900">
                                                        <span className="text-gray-400">@</span>{admin.username}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {admin.full_name || "No full name provided"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Added {new Date(admin.created_at).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeAdmin(admin.username)}
                                                className="admin-btn-danger shrink-0"
                                                title={`Remove @${admin.username}`}
                                            >
                                                <TrashIcon className="size-4"/>
                                                <span className="hidden sm:inline">Remove</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}