"use client";
import { useState } from "react";
import { useLocalStorage } from "react-use";
import { encodeUrl } from "@/utils/url";

export default function HomePage() {
  const [history, setHistory] = useLocalStorage<string[]>("history", []);
  const [url, setUrl] = useState("https://github.com/14790897");

  const handleSubmit = (event: any, urlToNavigate?: string) => {
    event.preventDefault();
    const targetUrl = urlToNavigate || url;
    // 更新历史记录，确保相同的网址不会重复
    let updatedHistory = history?.filter((item) => item !== targetUrl) || [];
    updatedHistory = [targetUrl, ...updatedHistory];
    setHistory(updatedHistory);
    const proxyUrl = encodeUrl(targetUrl);
    window.location.href = proxyUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-gradient-to-r from-gray-100 to-gray-200">
      <div className=" w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          输入您想访问的网址
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl p-8 rounded-lg border-t-4 border-blue-500"
        >
          <input
            type="text"
            className="block w-full p-4 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/14790897"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            访问
          </button>
        </form>
        {history && history.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              访问历史：
            </h2>
            <ul className="space-y-4">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
                >
                  <a
                    href="#"
                    onClick={(e) => handleSubmit(e, item)}
                    className="text-blue-500 hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
