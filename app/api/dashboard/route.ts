import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { fetchDeliveryRows, parseMonthParam } from "@/lib/delivery/server";

export const dynamic = "force-dynamic";

type Filters = {
  month: number;
  year: number;
  week: string;
  status: string;
  channel: string;
  chain: string;
  store: string;
  brand: string;
  product: string;
  search: string;
};

function cell(deliveries = 0, units = 0) {
  return { deliveries, units };
}

function addToBucket(map: Map<string, any>, key: string, base: Record<string, unknown>, deliveryRef: string, units: number, week: number) {
  if (!map.has(key)) {
    map.set(key, {
      ...base,
      deliveries: new Set<string>(),
      units: 0,
      weeks: [cell(), cell(), cell(), cell(), cell()],
    });
  }
  const row = map.get(key);
  row.deliveries.add(deliveryRef);
  row.units += units;
  row.weeks[week - 1].units += units;
  row.weeks[week - 1].refs ??= new Set<string>();
  row.weeks[week - 1].refs.add(deliveryRef);
}

function finalizeBuckets(map: Map<string, any>) {
  return Array.from(map.values()).map((row) => ({
    ...row,
    deliveries: row.deliveries.size,
    weeks: row.weeks.map((week: any) => ({
      deliveries: week.refs?.size ?? 0,
      units: week.units,
    })),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { response } = await requirePermission("canViewDashboard");
    if (response) return response;

    const params = request.nextUrl.searchParams;
    const parsedMonth = parseMonthParam(params.get("month"));
    const filters: Filters = {
      ...parsedMonth,
      week: params.get("week") ?? "all",
      status: params.get("status") ?? "completed",
      channel: params.get("channel") ?? "all",
      chain: params.get("chain") ?? "all",
      store: params.get("store") ?? "all",
      brand: params.get("brand") ?? "all",
      product: params.get("product") ?? "all",
      search: (params.get("search") ?? "").trim().toLowerCase(),
    };

    const supabase = await createClient();
    const rows = await fetchDeliveryRows(supabase);
    const masters = {
      channels: new Map<string, string>(),
      chains: new Map<string, { name: string; channel: string }>(),
      stores: new Map<string, { name: string; chain: string }>(),
      products: new Map<string, { name: string; brand: string }>(),
      brands: new Set<string>(),
    };

    const items = rows.flatMap((delivery) =>
      delivery.delivery_items.map((item) => ({ delivery, item, product: item.products })),
    );

    items.forEach(({ delivery, product }) => {
      if (delivery.channels) masters.channels.set(delivery.channel_id, delivery.channels.channel_name);
      if (delivery.chains) masters.chains.set(delivery.chain_id, { name: delivery.chains.chain_name, channel: delivery.channel_id });
      if (delivery.stores) masters.stores.set(delivery.store_id, { name: delivery.stores.store_name, chain: delivery.chain_id });
      if (product) {
        masters.products.set(product.id, { name: product.product_name, brand: product.brand ?? "Unbranded" });
        masters.brands.add(product.brand ?? "Unbranded");
      }
    });

    const filtered = items.filter(({ delivery, product }) => {
      const haystack = [
        delivery.delivery_ref,
        delivery.chains?.chain_name,
        delivery.stores?.store_name,
        delivery.stores?.store_code,
        product?.product_name,
        product?.product_code,
        delivery.stores?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        delivery.delivery_year === filters.year &&
        delivery.delivery_month === filters.month &&
        (filters.status === "all" || delivery.delivery_status === filters.status) &&
        (filters.week === "all" || delivery.reporting_week === Number(filters.week)) &&
        (filters.channel === "all" || delivery.channel_id === filters.channel) &&
        (filters.chain === "all" || delivery.chain_id === filters.chain) &&
        (filters.store === "all" || delivery.store_id === filters.store) &&
        (filters.brand === "all" || (product?.brand ?? "Unbranded") === filters.brand) &&
        (filters.product === "all" || product?.id === filters.product) &&
        (!filters.search || haystack.includes(filters.search))
      );
    });

    const deliveryRefs = new Set(filtered.map(({ delivery }) => delivery.delivery_ref));
    const units = filtered.reduce((sum, { item }) => sum + Number(item.units_delivered), 0);
    const chains = new Set(filtered.map(({ delivery }) => delivery.chain_id));
    const stores = new Set(filtered.map(({ delivery }) => delivery.store_id));
    const products = new Set(filtered.map(({ product }) => product?.id).filter(Boolean));
    const lastUpdated =
      filtered
        .map(({ item }) => item.import_timestamp)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null;

    const weekly = [1, 2, 3, 4, 5].map((week) => {
      const weekItems = filtered.filter(({ delivery }) => delivery.reporting_week === week);
      return {
        week,
        deliveries: new Set(weekItems.map(({ delivery }) => delivery.delivery_ref)).size,
        units: weekItems.reduce((sum, { item }) => sum + Number(item.units_delivered), 0),
      };
    });

    const channelMap = new Map();
    const chainMap = new Map();
    const storeMap = new Map();
    const productMap = new Map();
    const chainStoreMap = new Map();
    const storeProductMap = new Map();
    const productChainMap = new Map();
    const productStoreMap = new Map();

    filtered.forEach(({ delivery, item, product }) => {
      const unitsDelivered = Number(item.units_delivered);
      addToBucket(channelMap, delivery.channel_id, { id: delivery.channel_id, name: delivery.channels?.channel_name ?? "Unknown", chains: new Set(), stores: new Set() }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
      channelMap.get(delivery.channel_id).chains.add(delivery.chain_id);
      channelMap.get(delivery.channel_id).stores.add(delivery.store_id);

      addToBucket(chainMap, delivery.chain_id, { id: delivery.chain_id, name: delivery.chains?.chain_name ?? "Unknown", channel: delivery.channels?.channel_name ?? "", stores: new Set(), products: new Set() }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
      chainMap.get(delivery.chain_id).stores.add(delivery.store_id);
      if (product) chainMap.get(delivery.chain_id).products.add(product.id);

      addToBucket(storeMap, delivery.store_id, { id: delivery.store_id, name: delivery.stores?.store_name ?? "Unknown", chain: delivery.chains?.chain_name ?? "", location: delivery.stores?.location ?? "", state: delivery.stores?.state ?? "", products: new Set() }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
      if (product) storeMap.get(delivery.store_id).products.add(product.id);

      if (product) {
        addToBucket(productMap, product.id, { id: product.id, name: product.product_name, code: product.product_code, brand: product.brand ?? "", sku: product.sku ?? "", chains: new Set(), stores: new Set() }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
        productMap.get(product.id).chains.add(delivery.chain_id);
        productMap.get(product.id).stores.add(delivery.store_id);
      }

      addToBucket(chainStoreMap, `${delivery.chain_id}:${delivery.store_id}`, { chainId: delivery.chain_id, storeId: delivery.store_id, store: delivery.stores?.store_name ?? "Unknown", location: delivery.stores?.location ?? "" }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
      if (product) {
        addToBucket(storeProductMap, `${delivery.store_id}:${product.id}`, { storeId: delivery.store_id, productId: product.id, product: product.product_name, sku: product.sku ?? "" }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
        addToBucket(productChainMap, `${product.id}:${delivery.chain_id}`, { productId: product.id, chainId: delivery.chain_id, chain: delivery.chains?.chain_name ?? "Unknown" }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
        addToBucket(productStoreMap, `${product.id}:${delivery.store_id}`, { productId: product.id, chainId: delivery.chain_id, storeId: delivery.store_id, store: delivery.stores?.store_name ?? "Unknown", location: delivery.stores?.location ?? "" }, delivery.delivery_ref, unitsDelivered, delivery.reporting_week);
      }
    });

    const clean = (rowsToClean: any[]) =>
      rowsToClean
        .map((row) => ({
          ...row,
          chains: row.chains instanceof Set ? row.chains.size : row.chains,
          stores: row.stores instanceof Set ? row.stores.size : row.stores,
          products: row.products instanceof Set ? row.products.size : row.products,
        }))
        .sort((a, b) => b.units - a.units);

    const deliveryRecords = filtered
      .map(({ delivery, item, product }) => ({
        date: delivery.delivery_date,
        ref: delivery.delivery_ref,
        status: delivery.delivery_status,
        chain: delivery.chains?.chain_name ?? "",
        store: delivery.stores?.store_name ?? "",
        product: product?.product_name ?? "",
        code: product?.product_code ?? "",
        units: Number(item.units_delivered),
        sourceRowId: item.source_row_id,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      filters,
      summary: {
        deliveries: deliveryRefs.size,
        units,
        chains: chains.size,
        stores: stores.size,
        products: products.size,
        averageUnits: deliveryRefs.size ? Math.round((units / deliveryRefs.size) * 10) / 10 : 0,
        lastUpdated,
      },
      options: {
        channels: Array.from(masters.channels, ([id, name]) => ({ id, name })),
        chains: Array.from(masters.chains, ([id, value]) => ({ id, name: value.name, channelId: value.channel })),
        stores: Array.from(masters.stores, ([id, value]) => ({ id, name: value.name, chainId: value.chain })),
        products: Array.from(masters.products, ([id, value]) => ({ id, name: value.name, brand: value.brand })),
        brands: Array.from(masters.brands).sort(),
      },
      weekly,
      channels: clean(finalizeBuckets(channelMap)),
      chains: clean(finalizeBuckets(chainMap)),
      stores: clean(finalizeBuckets(storeMap)),
      products: clean(finalizeBuckets(productMap)),
      chainStores: clean(finalizeBuckets(chainStoreMap)),
      storeProducts: clean(finalizeBuckets(storeProductMap)),
      productChains: clean(finalizeBuckets(productChainMap)),
      productStores: clean(finalizeBuckets(productStoreMap)),
      deliveryRecords,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dashboard failed." }, { status: 500 });
  }
}
