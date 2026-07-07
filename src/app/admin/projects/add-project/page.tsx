'use client';

import {useState, useEffect, FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTap from '@/Components/TipTapEditor';
import GalleryPicker from '@/Components/GalleryPicker';

type Location = {
    id: number;
    location_en: string;
};

type Type = {
    id: number;
    type_en: string;
};

const AddProject = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [gallery, setGallery] = useState<File[]>([]);
    const [en, setTitleEn] = useState('');
    const [text_en, setTextEn] = useState('');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [link, setLink] = useState('');
    const [location_id, setLocationId] = useState('');
    const [type_id, setTypeId] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [speakers, setSpeakers] = useState('');
    const [delegates, setDelegates] = useState('');
    const [countries, setCountries] = useState('');
    const [companies, setCompanies] = useState('');
    const [media, setMedia] = useState('');
    const [loading, setLoading] = useState(false);
    const [organizers, setOrganizers] = useState<
        { organizer_en: string; organizer_logo: File | null }[]
    >([{organizer_en: '', organizer_logo: null}]);

    const addOrganizer = () => {
        setOrganizers([...organizers, {organizer_en: '', organizer_logo: null}]);
    };

    const removeOrganizer = (index: number) => {
        setOrganizers(organizers.filter((_, i) => i !== index));
    };

    const updateOrganizer = (index: number, field: string, value: string | File | null) => {
        const updated = [...organizers];
        updated[index] = {...updated[index], [field]: value};
        setOrganizers(updated);
    };

    const [participants, setParticipants] = useState<
        { participant_en: string; participant_logo: File | null }[]
    >([{participant_en: '', participant_logo: null}]);

    const addParticipant = () => {
        setParticipants([...participants, {participant_en: '', participant_logo: null}]);
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const updateParticipant = (index: number, field: string, value: string | File | null) => {
        const updated = [...participants];
        updated[index] = {...updated[index], [field]: value};
        setParticipants(updated);
    };

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке локаций:', err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        setIsClient(true);

        const fetchTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/types`);
                const data = await res.json();
                setTypes(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchTypes();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (loading) return;

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        if (logo) formData.append('logo', logo);
        formData.append('en', en);
        formData.append('text_en', text_en);
        formData.append('date', date);
        formData.append('end_date', endDate);
        formData.append('link', link);
        formData.append('location_id', location_id);
        formData.append('type_id', type_id);
        formData.append('speakers', speakers);
        formData.append('delegates', delegates);
        formData.append('countries', countries);
        formData.append('companies', companies);
        formData.append('media', media);
        gallery.forEach((f) => formData.append('gallery', f));
        if (organizers.some(o => o.organizer_en || o.organizer_logo)) {
            formData.append('organizers', JSON.stringify(organizers.map(o => ({
                organizer_en: o.organizer_en,
            }))));
            organizers.forEach(o => {
                if (o.organizer_logo) {
                    formData.append('organizer_logo', o.organizer_logo);
                }
            });
        }
        // Only send participants that have a logo, so the JSON order and the
        // uploaded file order line up 1:1 on the backend.
        const validParticipants = participants.filter(p => p.participant_logo);
        if (validParticipants.length > 0) {
            formData.append('participants', JSON.stringify(validParticipants.map(p => ({
                participant_en: p.participant_en,
            }))));
            validParticipants.forEach(p => {
                if (p.participant_logo) {
                    formData.append('participant_logo', p.participant_logo);
                }
            });
        }

        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                console.log('Проект добавлен!');
                router.push('/admin/projects');
            } else {
                const error = await res.text();
                console.error('Ошибка при добавлении проекта:', error);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add New Project</h2>

                        <div className="mb-4 flex flex-col space-y-2">
                            <div className="flex space-x-4">
                                <div className="w-1/3">
                                    <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                        Image:
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label htmlFor="logo" className="block text-gray-700 font-semibold mb-2">
                                        Logo <span className="font-normal text-gray-400">(optional)</span>:
                                    </label>
                                    <input
                                        type="file"
                                        id="logo"
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Start date:
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        End date:
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Link:
                                    </label>
                                    <input
                                        type="text"
                                        id="link"
                                        name="link"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Project location:
                                    </label>
                                    <select
                                        id="location_id"
                                        value={location_id}
                                        onChange={(e) => setLocationId(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    >
                                        <option value="">Select location</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.location_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Project type:
                                    </label>
                                    <select
                                        id="type_id"
                                        value={type_id}
                                        onChange={(e) => setTypeId(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    >
                                        <option value="">Select type</option>
                                        {types.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.type_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Speakers:
                                    </label>
                                    <input
                                        type="text"
                                        id="speakers"
                                        name="speakers"
                                        value={speakers}
                                        onChange={(e) => setSpeakers(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Delegates:
                                    </label>
                                    <input
                                        type="text"
                                        id="delegates"
                                        name="delegates"
                                        value={delegates}
                                        onChange={(e) => setDelegates(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Countries:
                                    </label>
                                    <input
                                        type="text"
                                        id="countries"
                                        name="countries"
                                        value={countries}
                                        onChange={(e) => setCountries(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Companies:
                                    </label>
                                    <input
                                        type="text"
                                        id="companies"
                                        name="companies"
                                        value={companies}
                                        onChange={(e) => setCompanies(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Media:
                                    </label>
                                    <input
                                        type="text"
                                        id="media"
                                        name="media"
                                        value={media}
                                        onChange={(e) => setMedia(e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        {isClient && (
                            <div className="bg-base-100 border border-gray-200 rounded-md p-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                    <TipTap content={en} onChange={setTitleEn} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                    <TipTap content={text_en} onChange={setTextEn} />
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Organizers</h3>
                            {organizers.map((org, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Organizer"
                                            value={org.organizer_en}
                                            onChange={(e) => updateOrganizer(index, 'organizer_en', e.target.value)}
                                            className="border border-gray-300 rounded p-2 w-full"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateOrganizer(index, 'organizer_logo', e.target.files?.[0] || null)}
                                            className="border border-gray-300 rounded p-2 w-full"
                                        />
                                    </div>

                                    {organizers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOrganizer(index)}
                                            className="text-red-600 text-sm mt-2"
                                        >
                                            Remove organizer
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addOrganizer}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                + Add organizer
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Participant companies</h3>
                            {participants.map((prt, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Company name (optional)"
                                            value={prt.participant_en}
                                            onChange={(e) => updateParticipant(index, 'participant_en', e.target.value)}
                                            className="border border-gray-300 rounded p-2 w-full"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateParticipant(index, 'participant_logo', e.target.files?.[0] || null)}
                                            className="border border-gray-300 rounded p-2 w-full"
                                        />
                                    </div>

                                    {participants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(index)}
                                            className="text-red-600 text-sm mt-2"
                                        >
                                            Remove company
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addParticipant}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                + Add company
                            </button>
                        </div>

                        <div className="mb-6">
                            <GalleryPicker
                                files={gallery}
                                onChange={setGallery}
                                label="Gallery images (optional)"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Project'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProject;
