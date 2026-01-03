import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const url = await db
      .select()
      .from(urls)
      .where(eq(urls.id, params.id))
      .limit(1);

    if (!url.length) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json(url[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const body = await request.json();
    const { originalUrl, title, description, isActive } = body;

    const updates: any = { updatedAt: new Date() };

    if (originalUrl !== undefined) {
      try {
        new URL(originalUrl);
        updates.originalUrl = originalUrl;
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await db
      .update(urls)
      .set(updates)
      .where(eq(urls.id, params.id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update URL" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;

    const deleted = await db
      .delete(urls)
      .where(eq(urls.id, params.id))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "URL deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete URL" },
      { status: 500 }
    );
  }
}
