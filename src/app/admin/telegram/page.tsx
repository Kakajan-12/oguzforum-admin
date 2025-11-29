"use client";

import React, {useState, useEffect, useCallback} from "react"; // ← ДОБАВИЛИ useCallback
import {useRouter} from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface TelegramAdmin {
    id: number;
    username: string;
    full_name: string;
    created_at: string;
}

export default function AdminTelegramPanel() {
    const [admins, setAdmins] = useState<TelegramAdmin[]>([]);
    const [newAdmin, setNewAdmin] = useState({username: "", fullName: ""});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const loadAdmins = useCallback(async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                router.push("/");
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            console.error("Error loading admins:", error);
        }
    }, [router]);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const addAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.username.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAdmin)
            });

            const result = await response.json();

            if (result.success) {
                setMessage(`Admin ${newAdmin.username} added`);
                setNewAdmin({username: "", fullName: ""});
                loadAdmins();
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch {
            setMessage("Error adding admin");
        } finally {
            setLoading(false);
        }
    };

    const removeAdmin = async (username: string) => {
        if (!confirm(`Remove admin ${username}?`)) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({username})
            });

            const result = await response.json();

            if (result.success) {
                setMessage(`Admin ${username} removed`);
                loadAdmins();
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch {
            setMessage("Error removing admin");
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Managing Telegram Admins</h2>

                    {message && (
                        <div className={`p-3 mb-4 rounded ${
                            message.includes('') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                                <p className="text-xs text-gray-500 mt-1">Admin username in Telegram</p>
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
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newAdmin.username.trim()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
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
                                {admins.map((admin) => (
                                    <div key={admin.id || admin.username} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">@{admin.username}</div>
                                            <div className="text-sm text-gray-600">
                                                {admin.full_name || 'Not specified'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Добавлен: {new Date(admin.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeAdmin(admin.username)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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