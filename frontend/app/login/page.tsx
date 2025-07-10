"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      username: userInfo.username,
      password: userInfo.password,
    });
    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2">
          <span className="text-gray-700">Username</span>
          <input
            type="text"
            value={userInfo.username}
            onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            value={userInfo.password}
            onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
} 