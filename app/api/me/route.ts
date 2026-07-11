import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context, response } = await requireAuth();
  if (response) return response;

  return NextResponse.json(context);
}
