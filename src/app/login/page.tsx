"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvRstRKv811PRBiJox0EAx4tOgpWVfystC1kOVrX7rikF0HkKNtYluZpgYmz2vQ19511WRo3u-ttsm2dzrqTL15Oxasbxf_o1_lNThE1Mm6QGu-piHzB6Ca65HZPMlzSNJqeFRs4aQVeZh4bar4Y7iBBfcP3UDadJ5f48d6xebPEFnTfi6Dim64QyqbHMjhfUOEnUgzCNTSsadB3AqP3THzHOduRJ-Dm-6Qtxv1E2jUK1f22OlotEub93mBqZxBAXpxIdBThvdb9EG";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      const { access, refresh } = response.data ?? {};

      if (!access || !refresh) {
        throw new Error("Missing tokens in response");
      }

      localStorage.setItem("nc_jwt_access", access);
      localStorage.setItem("nc_jwt_refresh", refresh);

      if (rememberMe) {
        localStorage.setItem("nc_jwt_username", username);
      } else {
        localStorage.removeItem("nc_jwt_username");
      }

      router.push("/admin");
    } catch (err) {
      setError("Invalid credentials or server unreachable.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <aside className="relative hidden flex-col justify-between bg-gray-900 px-10 py-12 text-gray-100 lg:flex">
          <div className="relative z-10 flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tracking-wide">NexusCouncil</span>
            </div>
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-800 bg-gray-800/40 shadow-xl">
              <div
                aria-hidden
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight">Welcome Back to NexusCouncil</h1>
              <p className="text-gray-400">
                Connecting governments, empowering communities.
              </p>
            </div>
          </div>
          <div className="relative z-10 text-sm text-gray-500">
            Secure access for administrators of the NexusCouncil CMS.
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 opacity-95" />
        </aside>
        <main className="flex items-center justify-center bg-gray-100 px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <header className="mb-8 space-y-2 text-left">
              <p className="text-3xl font-semibold tracking-tight">Sign in</p>
              <p className="text-sm text-gray-500">
                Enter your credentials to manage the NexusCouncil site.
              </p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-gray-700">Email or Username</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
                      />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="admin"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-gray-700">Password</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <rect width="14" height="10" x="5" y="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 flex h-full items-center px-3 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a className="font-medium text-gray-600 underline-offset-2 hover:underline" href="#">
                  Forgot password?
                </a>
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative flex items-center text-sm text-gray-400">
                <span className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-gray-500">Or continue with</span>
                <span className="flex-1 border-t border-gray-200" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.578 12.285c0-.82-.072-1.605-.21-2.355H12v4.44h5.94c-.258 1.433-1.035 2.658-2.22 3.495v2.88h3.705c2.163-1.995 3.41-4.815 3.41-8.15z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c3.24 0 5.955-1.08 7.94-2.91l-3.705-2.88c-1.08.72-2.457 1.155-4.235 1.155-3.264 0-6.03-2.205-7.02-5.183H1.19v2.97C3.15 20.258 7.215 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.98 13.552c-.225-.66-.354-1.365-.354-2.097s.129-1.437.354-2.097V6.39H1.19C.447 7.838.005 9.48.005 11.235c0 1.754.442 3.397 1.185 4.845l3.795-2.97z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 4.64c1.755 0 3.33.6 4.59 1.785l3.285-3.285C17.95.915 15.24 0 12 0 7.215 0 3.15 2.742 1.19 6.39l3.79 2.963C5.97 6.848 8.736 4.64 12 4.64z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M2.19 12.834h8.544V21.36h-8.544v-8.526zm0-10.452h8.544v8.526H2.19V2.382zm9.936 0v8.526h8.526V2.382h-8.526zm0 19.008v-8.514h8.526v8.514h-8.526z" fill="#F25022" />
                    <path d="M2.19 12.834h8.544V21.36h-8.544v-8.526z" fill="#00A4EF" />
                    <path d="M2.19 2.382h8.544v8.526H2.19V2.382z" fill="#7FBA00" />
                    <path d="M12.126 2.382v8.526h8.526V2.382h-8.526z" fill="#FFB900" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a className="font-medium text-gray-700 underline-offset-2 hover:underline" href="#">
                Sign up
              </a>
            </p>
            <p className="mt-4 text-center text-xs text-gray-400">
              This login uses <code className="font-mono">/api/token/</code> from Django (JWT).
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

