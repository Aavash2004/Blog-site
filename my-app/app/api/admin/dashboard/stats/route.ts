// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth-server";
import { getDashboardStats } from "@/lib/db";

export async function GET(request: Request) {
  const payload = verifyToken(request);

    if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}