import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUrls = await db.select().from(urls).orderBy(desc(urls.createdAt));
    return NextResponse.json(allUrls);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch URLs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { originalUrl, title, description, customShortCode } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: "Original URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate or use custom short code
    let shortCode = customShortCode || nanoid(6);

    // Check if short code already exists
    const existing = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, shortCode))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Short code already exists" },
        { status: 409 }
      );
    }

    const newUrl = await db
      .insert(urls)
      .values({
        shortCode,
        originalUrl,
        title: title || null,
        description: description || null,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(newUrl[0], { status: 201 });
  } catch (error) {
    console.error("Error creating URL:", error);
    return NextResponse.json(
      { error: "Failed to create URL" },
      { status: 500 }
    );
  }
}
