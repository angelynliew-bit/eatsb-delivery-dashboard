import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const allowed = new Set(["channels", "chains", "stores", "products", "deliveryRecords"]);

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const { response: authResponse } = await requirePermission("canExport");
  if (authResponse) return authResponse;

  const table = request.nextUrl.searchParams.get("table") ?? "chains";
  if (!allowed.has(table)) {
    return NextResponse.json({ error: "Unknown export table." }, { status: 400 });
  }

  const url = new URL("/api/dashboard", request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "table") url.searchParams.set(key, value);
  });

  const dashboardResponse = await fetch(url, {
    cache: "no-store",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });
  const data = await dashboardResponse.json();
  const rows = data[table] ?? [];
  const headers = rows.length ? Object.keys(rows[0]).filter((key) => key !== "weeks") : ["message"];
  const lines = [headers.join(",")];

  if (!rows.length) {
    lines.push("No rows for active filters");
  } else {
    for (const row of rows) {
      lines.push(headers.map((header) => csvEscape(row[header])).join(","));
    }
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${table}-export.csv"`,
    },
  });
}
