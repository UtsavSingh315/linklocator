import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { urls, clickEvents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// Function to get location data from coordinates using reverse geocoding
async function getLocationFromCoords(lat: string, lon: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "LinkLocator-URLShortener/1.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.address) {
      return {
        country: data.address.country || null,
        city:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          null,
        region: data.address.state || data.address.region || null,
      };
    }
  } catch (error) {
    console.error("Error fetching location from coords:", error);
  }
  return null;
}

// Function to get location data from IP
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,regionName,lat,lon`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
        region: data.regionName,
        latitude: data.lat?.toString(),
        longitude: data.lon?.toString(),
      };
    }
  } catch (error) {
    console.error("Error fetching location from IP:", error);
  }
  return null;
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ shortCode: string }> }
) {
  try {
    const params = await props.params;
    const { shortCode } = params;
    const body = await request.json();
    const { latitude, longitude, userAgent } = body;

    // Find the URL
    const urlRecord = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, shortCode))
      .limit(1);

    if (!urlRecord.length) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const url = urlRecord[0];

    // Check if URL is active
    if (!url.isActive) {
      return NextResponse.json(
        { error: "This URL has been disabled" },
        { status: 410 }
      );
    }

    // Get IP address from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let ipAddress = forwarded?.split(",")[0] || realIp || "unknown";

    // Clean up IPv6-mapped IPv4 addresses
    if (ipAddress.startsWith("::ffff:")) {
      ipAddress = ipAddress.substring(7);
    }

    let locationData = null;
    let finalLatitude = latitude;
    let finalLongitude = longitude;

    console.log(
      "Processing click - IP:",
      ipAddress,
      "Coords:",
      latitude,
      longitude
    );

    // If we have coordinates from the browser, use reverse geocoding
    if (latitude && longitude) {
      console.log("Using browser coordinates for location");
      locationData = await getLocationFromCoords(latitude, longitude);
      console.log("Reverse geocoded location:", locationData);
    }
    // Otherwise, try to get location from IP (skip local IPs)
    else if (
      ipAddress !== "unknown" &&
      ipAddress !== "::1" &&
      ipAddress !== "127.0.0.1" &&
      !ipAddress.startsWith("192.168.") &&
      !ipAddress.startsWith("10.") &&
      !ipAddress.startsWith("172.")
    ) {
      console.log("Using IP-based geolocation");
      const ipData = await getLocationFromIP(ipAddress);
      if (ipData) {
        locationData = {
          country: ipData.country,
          city: ipData.city,
          region: ipData.region,
        };
        finalLatitude = ipData.latitude || null;
        finalLongitude = ipData.longitude || null;
      }
      console.log("IP-based location:", locationData);
    } else {
      console.log("Skipping geolocation - local IP or no data available");
    }

    // Log click event
    await db.insert(clickEvents).values({
      urlId: url.id,
      ipAddress,
      userAgent: userAgent || request.headers.get("user-agent") || "unknown",
      country: locationData?.country || null,
      city: locationData?.city || null,
      region: locationData?.region || null,
      latitude: finalLatitude,
      longitude: finalLongitude,
    });

    // Increment click count
    await db
      .update(urls)
      .set({ clicks: sql`${urls.clicks} + 1` })
      .where(eq(urls.id, url.id));

    // Return the original URL for client-side redirect
    return NextResponse.json({ originalUrl: url.originalUrl });
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
