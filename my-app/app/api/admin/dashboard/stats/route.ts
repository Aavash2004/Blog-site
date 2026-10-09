// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { requireFreshAdmin } from "@/app/lib/auth-server";
import { getDashboardStats } from "@/lib/db";

export async function GET(request: Request) {
  const adminSession = await requireFreshAdmin(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
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