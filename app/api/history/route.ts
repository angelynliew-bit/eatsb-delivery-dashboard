import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/delivery/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { response } = await requirePermission("canViewHistory");
    if (response) return response;

    const supabase = supabaseServer();
    const [logs, exceptions, channels, chains, stores, products] = await Promise.all([
      supabase.from("import_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("import_exceptions").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("channels").select("*"),
      supabase.from("chains").select("*"),
      supabase.from("stores").select("*"),
      supabase.from("products").select("*"),
    ]);

    for (const result of [logs, exceptions, channels, chains, stores, products]) {
      if (result.error) throw new Error(result.error.message);
    }

    const channelMap = new Map((channels.data ?? []).map((channel: any) => [channel.id, { ...channel, channel_name: channel.channel_name ?? channel.name }]));
    const chainMap = new Map((chains.data ?? []).map((chain: any) => [chain.id, { ...chain, chain_name: chain.chain_name ?? chain.name }]));

    return NextResponse.json({
      logs: (logs.data ?? []).map((log: any) => ({
        ...log,
        file_name: log.file_name ?? log.filename,
        import_status: log.import_status ?? log.status,
        rows_skipped: log.rows_skipped ?? 0,
        completed_at: log.completed_at ?? log.imported_at ?? log.created_at,
      })),
      exceptions: (exceptions.data ?? []).map((exception: any) => ({
        ...exception,
        source_line_number: exception.source_line_number ?? exception.raw_data?.line_number,
        raw_delivery_ref: exception.raw_delivery_ref ?? exception.raw_data?.delivery_ref,
        raw_store_code: exception.raw_store_code ?? exception.raw_data?.store_code,
        raw_product_code: exception.raw_product_code ?? exception.raw_data?.product_code,
        error_message: exception.error_message ?? exception.error_detail,
      })),
      masterData: {
        channels: (channels.data ?? []).map((channel: any) => ({ ...channel, channel_code: channel.channel_code ?? channel.name, channel_name: channel.channel_name ?? channel.name })),
        chains: (chains.data ?? []).map((chain: any) => ({ ...chain, chain_name: chain.chain_name ?? chain.name, channels: channelMap.get(chain.channel_id) ?? null })),
        stores: (stores.data ?? []).map((store: any) => ({ ...store, store_name: store.store_name ?? store.name, chains: chainMap.get(store.chain_id) ?? null })),
        products: (products.data ?? []).map((product: any) => ({ ...product, product_name: product.product_name ?? product.name, sku: product.sku ?? product.product_code })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "History failed." }, { status: 500 });
  }
}
