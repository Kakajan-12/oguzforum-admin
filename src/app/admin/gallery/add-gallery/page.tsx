'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddProject = () => {
    const [image, setImage] = useState<File | null>(null);
    const [project_id, setProjectId] = useState('');
    const [projects, setProjects] = useState<{ id: number, tk: string, en: string, ru: string }[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
                const data = await res.json();
                setProjects(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('project_id', project_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gallery`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setProjectId('');
                router.push('/admin/gallery');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new gallery</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Project:
                                </label>
                                <select
                                    id="project_id"
                                    name="project_id"
                                    value={project_id}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select location</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.en} / {project.tk} / {project.ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add gallery
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProject;
