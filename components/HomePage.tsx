'use client'
import { useState } from "react";
import { useLocalStorage } from "react-use";

export default function HomePage() {
  const [url, setUrl] = useState("https://github.com/14790897");
const [history, setHistory] = useLocalStorage<string[]>("history", []);

  // 处理表单提交
  const handleSubmit = (event:any) => {
    event.preventDefault();
    const proxyUrl = encodeURIComponent(url);
    // 如果这里的目的是让用户访问输入的 URL，那么不应该对整个 URL 进行编码。
    window.location.href = proxyUrl; // 使用原始 URL 而不是编码后的 URL

    // 更新历史记录并保存到 localStorage
    const updatedHistory = [...(history || []), url]; // 确保 history 是数组
    setHistory(updatedHistory);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-700 mb-8">
        输入您想访问的网址
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-lg"
      >
        <input
          type="text"
          className="block w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/14790897"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full p-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          访问
        </button>
      </form>
      {history && history.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-lg font-semibold text-gray-700">访问历史：</h2>
          <ul className="list-disc pl-8 text-gray-600">
            {history.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
