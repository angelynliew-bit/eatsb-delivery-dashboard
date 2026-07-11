import { createClient } from "@supabase/supabase-js";

export type DeliveryStatus = "completed" | "partial" | "cancelled";

export type DeliveryRow = {
  id: string;
  delivery_ref: string;
  delivery_date: string;
  delivery_month: number;
  delivery_year: number;
  reporting_week: number;
  delivery_status: DeliveryStatus;
  invoice_number: string | null;
  entered_by: string | null;
  chain_id: string;
  store_id: string;
  channel_id: string;
  chains: { chain_code: string; chain_name: string } | null;
  stores: { store_code: string; store_name: string; location: string | null; state: string | null } | null;
  channels: { channel_code: string; channel_name: string } | null;
  delivery_items: Array<{
    id: string;
    units_delivered: number;
    source_row_id: string | null;
    source_line_number: number | null;
    import_timestamp: string | null;
    products: {
      id: string;
      product_code: string;
      product_name: string;
      brand: string | null;
      sku: string | null;
    } | null;
  }>;
};

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function reportingWeek(date: Date) {
  const day = date.getUTCDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
}

export function normalizeStatus(value: unknown): DeliveryStatus | null {
  const text = String(value ?? "completed").trim().toLowerCase();
  if (text === "completed" || text === "partial" || text === "cancelled") return text;
  return null;
}

export async function fetchDeliveryRows(client?: ReturnType<typeof supabaseServer>) {
  const supabase = client ?? supabaseServer();
  const [deliveries, items, channels, chains, stores, products] = await Promise.all([
    supabase.from("deliveries").select("*").order("delivery_date", { ascending: false }),
    supabase.from("delivery_items").select("*"),
    supabase.from("channels").select("*"),
    supabase.from("chains").select("*"),
    supabase.from("stores").select("*"),
    supabase.from("products").select("*"),
  ]);

  for (const result of [deliveries, items, channels, chains, stores, products]) {
    if (result.error) throw new Error(result.error.message);
  }

  const channelMap = new Map((channels.data ?? []).map((row: any) => [row.id, row]));
  const chainMap = new Map((chains.data ?? []).map((row: any) => [row.id, row]));
  const storeMap = new Map((stores.data ?? []).map((row: any) => [row.id, row]));
  const productMap = new Map((products.data ?? []).map((row: any) => [row.id, row]));
  const itemMap = new Map<string, any[]>();

  for (const item of items.data ?? []) {
    if (!itemMap.has(item.delivery_id)) itemMap.set(item.delivery_id, []);
    const product = productMap.get(item.product_id);
    itemMap.get(item.delivery_id)!.push({
      ...item,
      source_line_number: item.source_line_number ?? item.line_number ?? null,
      import_timestamp: item.import_timestamp ?? item.created_at ?? null,
      products: product
        ? {
            ...product,
            product_name: product.product_name ?? product.name,
            sku: product.sku ?? product.product_code,
          }
        : null,
    });
  }

  return (deliveries.data ?? []).map((delivery: any) => ({
    ...delivery,
    delivery_status: delivery.delivery_status ?? delivery.status ?? "completed",
    chain_id: delivery.chain_id ?? storeMap.get(delivery.store_id)?.chain_id,
    channel_id: delivery.channel_id ?? chainMap.get(storeMap.get(delivery.store_id)?.chain_id)?.channel_id,
    chains: chainMap.get(delivery.chain_id ?? storeMap.get(delivery.store_id)?.chain_id)
      ? {
          ...chainMap.get(delivery.chain_id ?? storeMap.get(delivery.store_id)?.chain_id),
          chain_name: chainMap.get(delivery.chain_id ?? storeMap.get(delivery.store_id)?.chain_id).chain_name ?? chainMap.get(delivery.chain_id ?? storeMap.get(delivery.store_id)?.chain_id).name,
        }
      : null,
    stores: storeMap.get(delivery.store_id)
      ? {
          ...storeMap.get(delivery.store_id),
          store_name: storeMap.get(delivery.store_id).store_name ?? storeMap.get(delivery.store_id).name,
        }
      : null,
    channels: channelMap.get(delivery.channel_id ?? chainMap.get(storeMap.get(delivery.store_id)?.chain_id)?.channel_id)
      ? {
          ...channelMap.get(delivery.channel_id ?? chainMap.get(storeMap.get(delivery.store_id)?.chain_id)?.channel_id),
          channel_name: channelMap.get(delivery.channel_id ?? chainMap.get(storeMap.get(delivery.store_id)?.chain_id)?.channel_id).channel_name ?? channelMap.get(delivery.channel_id ?? chainMap.get(storeMap.get(delivery.store_id)?.chain_id)?.channel_id).name,
        }
      : null,
    delivery_items: itemMap.get(delivery.id) ?? [],
  })) as DeliveryRow[];
}

export function parseMonthParam(value: string | null) {
  const fallback = "2026-07";
  const source = value && /^\d{4}-\d{2}$/.test(value) ? value : fallback;
  const [year, month] = source.split("-").map(Number);
  return { value: source, year, month };
}
