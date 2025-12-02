"use client";

import React, {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

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

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Managing Telegram Admins</h2>

                    {message && (
                        <div className={`p-3 mb-4 rounded ${
                            message.includes("✅") ? "bg-green-100 text-green-800" :
                                message.includes("❌") ? "bg-red-100 text-red-800" :
                                    "bg-blue-100 text-blue-800"
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={addAdmin} className="mb-8 p-4 border rounded">
                        <h3 className="text-lg font-semibold mb-4">Add a new admin</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Username *</label>
                                <input
                                    type="text"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                                    placeholder="username (без @)"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Telegram username without @</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Full name</label>
                                <input
                                    type="text"
                                    value={newAdmin.fullName}
                                    onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})}
                                    placeholder="Имя Фамилия"
                                    className="w-full p-2 border rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: admin&apos;s full name</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newAdmin.username.trim()}
                            className={`px-4 py-2 rounded transition-colors ${
                                loading || !newAdmin.username.trim()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                            {loading ? "Adding..." : "Add admin"}
                        </button>
                    </form>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Current admins ({admins.length})</h3>

                        {admins.length === 0 ? (
                            <p className="text-gray-500">There are no registered admins.</p>
                        ) : (
                            <div className="space-y-3">
                                {admins.map((admin, index) => (
                                    <div key={`${admin.username}-${index}`} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                        <div>
                                            <div className="font-medium flex items-center">
                                                <span className="text-gray-500 mr-2">@</span>
                                                {admin.username}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {admin.full_name || "No full name provided"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Added: {new Date(admin.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeAdmin(admin.username)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                            title={`Remove @${admin.username}`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}