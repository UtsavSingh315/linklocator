"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  description: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

interface ClickEvent {
  id: string;
  urlId: string;
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
  timestamp: string;
}

export default function DashboardPage() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUrl, setEditingUrl] = useState<Url | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ClickEvent[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    originalUrl: "",
    title: "",
    description: "",
    customShortCode: "",
  });

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls");
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          originalUrl: "",
          title: "",
          description: "",
          customShortCode: "",
        });
        setShowCreateForm(false);
        fetchUrls();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create URL");
      }
    } catch (error) {
      alert("Failed to create URL");
    }
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUrl) return;

    try {
      const response = await fetch(`/api/urls/${editingUrl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: formData.originalUrl,
          title: formData.title,
          description: formData.description,
          isActive: editingUrl.isActive,
        }),
      });

      if (response.ok) {
        setEditingUrl(null);
        setFormData({
          originalUrl: "",
          title: "",
          description: "",
          customShortCode: "",
        });
        fetchUrls();
      }
    } catch (error) {
      alert("Failed to update URL");
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      const response = await fetch(`/api/urls/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchUrls();
      }
    } catch (error) {
      alert("Failed to delete URL");
    }
  };

  const toggleUrlStatus = async (url: Url) => {
    try {
      const response = await fetch(`/api/urls/${url.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !url.isActive }),
      });

      if (response.ok) {
        fetchUrls();
      }
    } catch (error) {
      alert("Failed to update URL status");
    }
  };

  const startEdit = (url: Url) => {
    setEditingUrl(url);
    setFormData({
      originalUrl: url.originalUrl,
      title: url.title || "",
      description: url.description || "",
      customShortCode: "",
    });
    setShowCreateForm(false);
  };

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const viewAnalytics = async (urlId: string) => {
    setViewingAnalytics(urlId);
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/urls/${urlId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const closeAnalytics = () => {
    setViewingAnalytics(null);
    setAnalyticsData([]);
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter((url) => url.isActive).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              URL Shortener Admin
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total URLs
            </h3>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
              {urls.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Active URLs
            </h3>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
              {activeUrls}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Clicks
            </h3>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
              {totalClicks}
            </p>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingUrl) && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              {editingUrl ? "Edit URL" : "Create New Short URL"}
            </h2>
            <form
              onSubmit={editingUrl ? handleUpdateUrl : handleCreateUrl}
              className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Original URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.originalUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, originalUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  placeholder="https://example.com/very-long-url"
                />
              </div>
              {!editingUrl && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Custom Short Code (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customShortCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customShortCode: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                    placeholder="my-custom-code"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  placeholder="My Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  rows={3}
                  placeholder="Description of the URL"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  {editingUrl ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUrl(null);
                    setFormData({
                      originalUrl: "",
                      title: "",
                      description: "",
                      customShortCode: "",
                    });
                  }}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showCreateForm && !editingUrl && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            + Create New URL
          </button>
        )}

        {/* URLs Table */}
        <div className="rounded-lg bg-white shadow dark:bg-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Short Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400">
                      Loading...
                    </td>
                  </tr>
                ) : urls.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400">
                      No URLs created yet
                    </td>
                  </tr>
                ) : (
                  urls.map((url) => (
                    <tr
                      key={url.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => copyToClipboard(url.shortCode)}
                          className="font-mono text-sm text-blue-600 hover:underline dark:text-blue-400">
                          {url.shortCode}
                        </button>
                      </td>
                      <td className="max-w-md truncate px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                        {url.title ? (
                          <div>
                            <div className="font-medium">{url.title}</div>
                            <div className="text-zinc-500 dark:text-zinc-400">
                              {url.originalUrl}
                            </div>
                          </div>
                        ) : (
                          url.originalUrl
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                        {url.clicks}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => toggleUrlStatus(url)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            url.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                          {url.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => viewAnalytics(url.id)}
                          className="mr-3 text-purple-600 hover:underline dark:text-purple-400">
                          Analytics
                        </button>
                        <button
                          onClick={() => startEdit(url)}
                          className="mr-3 text-blue-600 hover:underline dark:text-blue-400">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUrl(url.id)}
                          className="text-red-600 hover:underline dark:text-red-400">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Modal */}
        {viewingAnalytics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  Click Analytics
                </h2>
                <button
                  onClick={closeAnalytics}
                  className="rounded-md px-4 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">
                  ✕ Close
                </button>
              </div>

              {analyticsLoading ? (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                  Loading analytics...
                </div>
              ) : analyticsData.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No clicks recorded yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-zinc-200 dark:border-zinc-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          IP Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Coordinates
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          User Agent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {analyticsData.map((click) => (
                        <tr
                          key={click.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                            {new Date(click.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                            {click.city && click.country ? (
                              <div>
                                <div className="font-medium">
                                  {click.city}, {click.region}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {click.country}
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-500 dark:text-zinc-400">
                                Unknown
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                            {click.ipAddress || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                            {click.latitude && click.longitude ? (
                              <div className="space-y-1">
                                <div className="font-mono text-xs">
                                  <div>{click.latitude}° N</div>
                                  <div>{click.longitude}° E</div>
                                </div>
                                <a
                                  href={`https://www.google.com/maps?q=${click.latitude},${click.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  View on Maps
                                </a>
                              </div>
                            ) : (
                              <span className="text-zinc-500 dark:text-zinc-400">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="max-w-xs truncate px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {click.userAgent || "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
