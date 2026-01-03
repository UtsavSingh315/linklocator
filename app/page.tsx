import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            LinkIT
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Professional URL Shortener with Admin Panel
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/admin/login"
            className="flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Admin Login
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex h-12 items-center justify-center rounded-lg border border-zinc-300 px-8 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800">
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
