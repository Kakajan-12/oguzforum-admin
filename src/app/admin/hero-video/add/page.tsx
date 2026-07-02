"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

const AddSlider = () => {
  const [video, setVideo] = useState<File | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Нет токена. Пользователь не авторизован.");
      return;
    }

    const formData = new FormData();
    if (video) formData.append("video", video);
    formData.append("en", "");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sliders`,
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
        setVideo(null);

        router.push("/admin/hero-video");
      } else {
        const errorText = await response.text();
        console.error("Ошибка при добавлении слайда:", errorText);
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
            <h2 className="text-2xl font-bold mb-4 text-left">Add hero video</h2>

            <div className="mb-4">
              <label
                htmlFor="video"
                className="block text-gray-700 font-semibold mb-2"
              >
                Video (mp4 / webm):
              </label>
              <input
                type="file"
                id="video"
                accept="video/mp4,video/webm"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideo(e.target.files[0]);
                  }
                }}
                required
                className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
              />
            </div>

            <button
              type="submit"
              className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
              Add hero video
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSlider;
