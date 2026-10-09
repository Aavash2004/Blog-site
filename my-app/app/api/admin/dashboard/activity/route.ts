
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth-server";
import { getRecentActivity } from "@/lib/db";

export async function GET(request: Request) {
  const payload = verifyToken(request);

   if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const activity = await getRecentActivity(10);
    return NextResponse.json(activity);
  } catch (err) {
    console.error("Dashboard activity error:", err);
    return NextResponse.json(
      { error: "Failed to load activity" },
      { status: 500 }
    );
  }
}