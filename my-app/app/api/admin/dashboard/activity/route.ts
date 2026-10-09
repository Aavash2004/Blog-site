import { NextResponse } from "next/server";
import { requireFreshAdmin } from "@/app/lib/auth-server";
import { getRecentActivity } from "@/lib/db";

export async function GET(request: Request) {
  const adminSession = await requireFreshAdmin(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
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