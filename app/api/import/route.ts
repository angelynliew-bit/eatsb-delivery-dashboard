import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requirePermission } from "@/lib/auth/server";
import { normalizeStatus, reportingWeek } from "@/lib/delivery/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RawRow = Record<string, unknown>;

const aliases: Record<string, string[]> = {
  delivery_ref: ["delivery_ref", "delivery reference", "deliveryreference", "do", "do number", "delivery no"],
  delivery_date: ["delivery_date", "delivery date", "date"],
  order_number: ["order_number", "order number", "order no"],
  chain_code: ["chain_code", "chain code"],
  chain_name: ["chain_name", "chain name", "chain"],
  store_code: ["store_code", "store code"],
  store_name: ["store_name", "store name", "store"],
  location: ["location"],
  state: ["state"],
  product_code: ["product_code", "product code", "sku code"],
  product_name: ["product_name", "product name", "product"],
  brand: ["brand"],
  units_delivered: ["units_delivered", "units delivered", "units", "quantity", "qty"],
  delivery_status: ["delivery_status", "delivery status", "status"],
  source_row_id: ["source_row_id", "source row id", "row id"],
  last_modified_date: ["last_modified_date", "last modified date", "modified date"],
};

function pick(row: RawRow, key: string) {
  const normalized = new Map(Object.entries(row).map(([name, value]) => [name.trim().toLowerCase(), value]));
  for (const alias of aliases[key]) {
    if (normalized.has(alias)) return normalized.get(alias);
  }
  return undefined;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  const raw = text(value);
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.valueOf())) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeRow(row: RawRow, index: number) {
  const date = parseDateValue(pick(row, "delivery_date"));
  const units = Number(pick(row, "units_delivered"));
  const status = normalizeStatus(pick(row, "delivery_status"));
  return {
    source_line_number: index + 2,
    delivery_ref: text(pick(row, "delivery_ref")),
    delivery_date: date ? isoDate(date) : "",
    order_number: text(pick(row, "order_number")),
    chain_code: text(pick(row, "chain_code")),
    chain_name: text(pick(row, "chain_name")),
    store_code: text(pick(row, "store_code")),
    store_name: text(pick(row, "store_name")),
    location: text(pick(row, "location")),
    state: text(pick(row, "state")),
    product_code: text(pick(row, "product_code")),
    product_name: text(pick(row, "product_name")),
    brand: text(pick(row, "brand")),
    units_delivered: Number.isFinite(units) ? units : null,
    delivery_status: status,
    source_row_id: text(pick(row, "source_row_id")),
    last_modified_date: parseDateValue(pick(row, "last_modified_date")) ? isoDate(parseDateValue(pick(row, "last_modified_date"))!) : null,
    raw: row,
  };
}

async function rowsFromRequest(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new Error("Upload a CSV or Excel file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("File is larger than 10 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  return { fileName: file.name, rows: rawRows.map(normalizeRow) };
}

async function loadMasters(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: stores, error: storeError }, { data: chains, error: chainError }, { data: products, error: productError }] = await Promise.all([
    supabase.from("stores").select("*"),
    supabase.from("chains").select("*"),
    supabase.from("products").select("*"),
  ]);
  if (storeError) throw new Error(storeError.message);
  if (chainError) throw new Error(chainError.message);
  if (productError) throw new Error(productError.message);
  const chainMap = new Map((chains ?? []).map((chain: any) => [chain.id, chain]));
  return {
    stores: new Map((stores ?? []).map((store: any) => [store.store_code, { ...store, chains: chainMap.get(store.chain_id) }])),
    products: new Map((products ?? []).map((product: any) => [product.product_code, product])),
  };
}

function validationError(row: any, masters: Awaited<ReturnType<typeof loadMasters>>) {
  if (!row.delivery_ref) return ["MISSING_DELIVERY_REF", "Delivery reference is required."];
  if (!row.delivery_date) return ["INVALID_DATE", "Delivery date is missing or invalid."];
  if (!row.store_code) return ["MISSING_STORE_CODE", "Store code is required."];
  if (!masters.stores.has(row.store_code)) return ["UNKNOWN_STORE", `Store code ${row.store_code} is not in master data.`];
  if (!row.product_code) return ["MISSING_PRODUCT_CODE", "Product code is required."];
  if (!masters.products.has(row.product_code)) return ["UNKNOWN_PRODUCT", `Product code ${row.product_code} is not in master data.`];
  if (row.units_delivered === null || Number.isNaN(row.units_delivered) || row.units_delivered < 0) return ["INVALID_UNITS", "Units delivered must be a non-negative number."];
  if (!row.delivery_status) return ["INVALID_STATUS", "Delivery status must be completed, partial, or cancelled."];
  const store: any = masters.stores.get(row.store_code);
  if (row.chain_code && store.chains?.chain_code && store.chains.chain_code !== row.chain_code) return ["CHAIN_STORE_MISMATCH", "Store does not belong to the supplied chain code."];
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requirePermission("canImport");
    if (response) return response;

    const action = request.nextUrl.searchParams.get("action") ?? "preview";
    const supabase = await createClient();
    const { fileName, rows } = await rowsFromRequest(request);
    const masters = await loadMasters(supabase);

    const previewRows = rows.map((row) => {
      const error = validationError(row, masters);
      return {
        ...row,
        error_type: error?.[0] ?? null,
        error_message: error?.[1] ?? null,
      };
    });

    if (action === "preview") {
      return NextResponse.json({
        fileName,
        totalRows: rows.length,
        preview: previewRows.slice(0, 10),
        invalidRows: previewRows.filter((row) => row.error_type).length,
      });
    }

    const { data: log, error: logError } = await supabase
      .from("import_logs")
      .insert({
        filename: fileName,
        status: "pending",
        rows_processed: rows.length,
      })
      .select("id")
      .single();
    if (logError) throw new Error(logError.message);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const exceptions: any[] = [];

    for (const row of rows) {
      const error = validationError(row, masters);
      if (error) {
        exceptions.push({
          import_log_id: log.id,
          source_row_id: row.source_row_id || null,
          raw_data: {
            line_number: row.source_line_number,
            delivery_ref: row.delivery_ref,
            store_code: row.store_code,
            product_code: row.product_code,
            delivery_date: row.delivery_date,
            units_delivered: row.units_delivered,
          },
          error_type: error[0],
          error_detail: error[1],
        });
        continue;
      }

      const store: any = masters.stores.get(row.store_code);
      const product: any = masters.products.get(row.product_code);
      const date = new Date(`${row.delivery_date}T00:00:00Z`);
      const sourceRowId = row.source_row_id || `${row.delivery_ref}-${row.product_code}-${row.source_line_number}`;
      const deliveryPayload = {
        delivery_ref: row.delivery_ref,
        delivery_date: row.delivery_date,
        delivery_month: date.getUTCMonth() + 1,
        delivery_year: date.getUTCFullYear(),
        reporting_week: reportingWeek(date),
        store_id: store.id,
        status: row.delivery_status,
      };

      const { data: existingDelivery, error: existingDeliveryError } = await supabase
        .from("deliveries")
        .select("id")
        .eq("delivery_ref", row.delivery_ref)
        .maybeSingle();
      if (existingDeliveryError) throw new Error(existingDeliveryError.message);

      const delivery = existingDelivery
        ? (
            await supabase
              .from("deliveries")
              .update(deliveryPayload)
              .eq("id", existingDelivery.id)
              .select("id")
              .single()
          ).data
        : (
            await supabase
              .from("deliveries")
              .insert(deliveryPayload)
              .select("id")
              .single()
          ).data;
      if (!delivery) throw new Error("Delivery write failed.");

      const { data: existing, error: existingError } = await supabase
        .from("delivery_items")
        .select("id, delivery_id, product_id, units_delivered")
        .eq("source_row_id", sourceRowId)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);

      const itemPayload = {
        delivery_id: delivery.id,
        product_id: product.id,
        units_delivered: row.units_delivered,
        source_row_id: sourceRowId,
        line_number: row.source_line_number,
        import_log_id: log.id,
      };

      if (existing) {
        const unchanged =
          existing.delivery_id === itemPayload.delivery_id &&
          existing.product_id === itemPayload.product_id &&
          Number(existing.units_delivered) === Number(itemPayload.units_delivered) &&
          true;
        if (unchanged) {
          skipped += 1;
        } else {
          const { error: updateError } = await supabase.from("delivery_items").update(itemPayload).eq("id", existing.id);
          if (updateError) throw new Error(updateError.message);
          updated += 1;
        }
      } else {
        const { error: insertError } = await supabase.from("delivery_items").insert(itemPayload);
        if (insertError) throw new Error(insertError.message);
        inserted += 1;
      }
    }

    if (exceptions.length) {
      const { error: exceptionError } = await supabase.from("import_exceptions").insert(exceptions);
      if (exceptionError) throw new Error(exceptionError.message);
    }

    const status = exceptions.length === rows.length ? "failed" : exceptions.length ? "partial" : "success";
    const { error: updateLogError } = await supabase
      .from("import_logs")
      .update({
        status,
        rows_inserted: inserted,
        rows_updated: updated,
        rows_rejected: exceptions.length,
        imported_at: new Date().toISOString(),
      })
      .eq("id", log.id);
    if (updateLogError) throw new Error(updateLogError.message);

    return NextResponse.json({
      importLogId: log.id,
      fileName,
      status,
      rowsProcessed: rows.length,
      inserted,
      updated,
      rejected: exceptions.length,
      skipped,
      exceptions: exceptions.map((exception) => ({
        ...exception,
        source_line_number: exception.raw_data.line_number,
        raw_delivery_ref: exception.raw_data.delivery_ref,
        raw_store_code: exception.raw_data.store_code,
        raw_product_code: exception.raw_data.product_code,
        error_message: exception.error_detail,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 400 });
  }
}
