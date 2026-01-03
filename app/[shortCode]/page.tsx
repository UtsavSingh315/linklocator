"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Preparing redirect...");
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt");
  const shortCode = params.shortCode as string;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let hasRedirected = false;

    const checkPermissionAndGetLocation = async () => {
      if (hasRedirected) return;

      try {
        // Check permission status
        if ("permissions" in navigator) {
          try {
            const result = await navigator.permissions.query({
              name: "geolocation" as PermissionName,
            });
            setPermissionStatus(result.state);

            console.log("Permission state:", result.state);

            if (result.state === "denied") {
              setStatus(
                "Location permission denied. Please enable location in your browser settings and refresh the page."
              );
              return;
            }

            if (result.state === "granted") {
              setStatus("Location permission granted. Getting location...");
            } else {
              setStatus("Please allow location access when prompted...");
            }
          } catch (e) {
            console.log(
              "Permissions API not fully supported, proceeding with geolocation"
            );
          }
        }

        // Request geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (hasRedirected) return;

              const latitude = position.coords.latitude.toString();
              const longitude = position.coords.longitude.toString();

              console.log("Location obtained:", latitude, longitude);
              setStatus("Location obtained! Redirecting...");

              hasRedirected = true;
              if (intervalId) clearInterval(intervalId);

              // Make API request and redirect
              await performRedirect(latitude, longitude);
            },
            (geoError) => {
              console.log("Geolocation error:", geoError);

              if (geoError.code === 1) {
                setStatus(
                  "Location permission denied. Please allow location access to continue."
                );
                setPermissionStatus("denied");
              } else if (geoError.code === 2) {
                setStatus("Location unavailable. Checking again...");
              } else if (geoError.code === 3) {
                setStatus("Location request timeout. Trying again...");
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        } else {
          setStatus("Geolocation not supported by your browser");
          // Redirect without location after 3 seconds
          setTimeout(() => {
            if (!hasRedirected) {
              hasRedirected = true;
              performRedirect(null, null);
            }
          }, 3000);
        }
      } catch (err) {
        console.error("Error in location check:", err);
      }
    };

    const performRedirect = async (
      latitude: string | null,
      longitude: string | null
    ) => {
      try {
        const response = await fetch(`/api/redirect/${shortCode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude,
            longitude,
            userAgent: navigator.userAgent,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("URL not found");
          } else if (response.status === 410) {
            setError("This URL has been disabled");
          } else {
            setError("Failed to redirect");
          }
          return;
        }

        const data = await response.json();
        window.location.href = data.originalUrl;
      } catch (err) {
        console.error("Redirect error:", err);
        setError("An error occurred");
      }
    };

    // Initial check
    checkPermissionAndGetLocation();

    // Keep trying every 5 seconds if permission is still prompt or location fails
    intervalId = setInterval(() => {
      if (!hasRedirected && permissionStatus !== "denied") {
        console.log("Retrying location request...");
        checkPermissionAndGetLocation();
      }
    }, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [shortCode, router, permissionStatus]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error
          </h1>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="max-w-md text-center">
        {permissionStatus === "denied" ? (
          <div>
            <Image
              className="w-[70vw] max-w-72 mx-auto mb-4"
              src="/locationReq.png"
              alt="Location Denied"
              width={100}
              height={100}
            />
            <h1 className="mb-4 text-3xl font-bold text-zinc-900">
              Beta Only Available in <br /> INDIA
            </h1>
          </div>
        ) : (
          <h1 className="mb-4 text-3xl font-bold text-zinc-900 ">
            Redirecting...
          </h1>
        )}

        <p className="mb-6 text-lg text-zinc-900 ">
          Unable to detect closest server in your region. Please enable
          location.
        </p>

        {permissionStatus !== "denied" && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              📍 Please allow location access when prompted
            </p>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
              We need this to connect you to the nearest server
            </p>
          </div>
        )}

        {permissionStatus === "denied" && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              To continue, please:
            </p>
            <ol className="mt-2 space-y-1 text-left text-xs text-red-700 dark:text-red-400">
              <li>1. Click the location icon in your browser's address bar</li>
              <li>2. Change permission to "Allow"</li>
              <li>3. Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
