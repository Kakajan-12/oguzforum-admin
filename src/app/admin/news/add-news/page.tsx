"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import TipTap from "@/Components/TipTapEditor";
import GalleryPicker from "@/Components/GalleryPicker";

const AddNews = () => {
  const [isClient, setIsClient] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [en, setTitleEn] = useState("");
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getTodayDate());
  const [text_en, setTextEn] = useState("");
  const [news_cat_id, setNewsCat] = useState("");
  const [categories, setCategories] = useState<
    { id: number; cat_en: string }[]
  >([]);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/news-cat`,
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Неверный формат данных категорий:", data);
        }
      } catch (err) {
        console.error("Ошибка при загрузке категорий:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Нет токена. Пользователь не авторизован.");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("en", en ?? "");
    formData.append("date", date ?? "");
    formData.append("text_en", text_en ?? "");
    formData.append("news_cat_id", news_cat_id ?? "");
    gallery.forEach((f) => formData.append("gallery", f));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/news`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("добавлен!", data);
        setImage(null);
        setGallery([]);
        setTitleEn("");
        setDate("");
        setTextEn("");
        setNewsCat("");
        router.push("/admin/news");
      } else {
        const errorText = await response.text();
        console.error("Ошибка при добавлении:", errorText);
      }
    } catch (error) {
      console.error("Ошибка запроса", error);
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
            <h2 className="text-2xl font-bold mb-4 text-left">Add new news</h2>

            <div className="mb-4 flex space-x-4">
              <div className="w-full">
                <label
                  htmlFor="image"
                  className="block text-gray-700 font-semibold mb-2"
                >
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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date:
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
              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  News Category:
                </label>
                <select
                  id="news_cat"
                  name="news_cat"
                  value={news_cat_id}
                  onChange={(e) => setNewsCat(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.cat_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isClient && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Title:
                  </label>
                  <TipTap content={en} onChange={setTitleEn} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Text:
                  </label>
                  <TipTap content={text_en} onChange={setTextEn} />
                </div>
              </>
            )}

            <div className="mb-4">
              <GalleryPicker
                files={gallery}
                onChange={setGallery}
                label="Gallery images (optional)"
              />
            </div>

            <button
              type="submit"
              className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
              Add news
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNews;
