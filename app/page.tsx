"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Dashboard = any;

const tabs = ["Overview", "Import", "Drill-down", "Records", "History", "Master Data"];
const exportTables = ["chains", "stores", "products", "deliveryRecords"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-MY").format(value ?? 0);
}

function cellText(cell: { deliveries: number; units: number }) {
  return `${cell.deliveries} delivery${cell.deliveries === 1 ? "" : "ies"} / ${formatNumber(cell.units)} units`;
}

function optionList(options: any[] = [], allLabel = "All") {
  return (
    <>
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option.id ?? option} value={option.id ?? option}>
          {option.name ?? option}
        </option>
      ))}
    </>
  );
}

function DataTable({ rows, columns, empty = "No rows for the active filters." }: { rows: any[]; columns: Array<[string, string | ((row: any) => string | number)]>; empty?: string }) {
  if (!rows?.length) return <div className="empty">{empty}</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(([label]) => <th key={label}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.ref ?? `${row.name}-${index}`}>
              {columns.map(([label, key]) => (
                <td key={label}>{typeof key === "function" ? key(row) : row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Matrix({ rows, nameKey = "name" }: { rows: any[]; nameKey?: string }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        ["Name", (row) => row[nameKey]],
        ["Week 1", (row) => cellText(row.weeks[0])],
        ["Week 2", (row) => cellText(row.weeks[1])],
        ["Week 3", (row) => cellText(row.weeks[2])],
        ["Week 4", (row) => cellText(row.weeks[3])],
        ["Week 5", (row) => cellText(row.weeks[4])],
        ["Total", (row) => cellText({ deliveries: row.deliveries, units: row.units })],
      ]}
    />
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [filters, setFilters] = useState({
    month: "2026-07",
    week: "all",
    status: "completed",
    channel: "all",
    chain: "all",
    store: "all",
    brand: "all",
    product: "all",
    search: "",
  });

  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);

  async function loadDashboard() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/dashboard?${query}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDashboard(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Dashboard failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    const response = await fetch("/api/history", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setHistory(data);
  }

  useEffect(() => {
    loadDashboard();
  }, [query]);

  useEffect(() => {
    loadHistory();
  }, []);

  function setFilter(name: string, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "channel" ? { chain: "all", store: "all" } : {}),
      ...(name === "chain" ? { store: "all" } : {}),
      ...(name === "brand" ? { product: "all" } : {}),
    }));
  }

  async function upload(action: "preview" | "import") {
    if (!selectedFile) {
      setMessage("Choose a CSV or Excel file first.");
      return;
    }
    const form = new FormData();
    form.append("file", selectedFile);
    setMessage(action === "preview" ? "Parsing file..." : "Importing rows...");
    const response = await fetch(`/api/import?action=${action}`, { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Import failed.");
      return;
    }
    if (action === "preview") setPreview(data);
    if (action === "import") {
      setImportResult(data);
      setPreview(null);
      await Promise.all([loadDashboard(), loadHistory()]);
    }
    setMessage("");
  }

  async function handlePreview(event: FormEvent) {
    event.preventDefault();
    await upload("preview");
  }

  const options = dashboard?.options ?? {};
  const chains = (options.chains ?? []).filter((chain: any) => filters.channel === "all" || chain.channelId === filters.channel);
  const stores = (options.stores ?? []).filter((store: any) => filters.chain === "all" || store.chainId === filters.chain);
  const products = (options.products ?? []).filter((product: any) => filters.brand === "all" || product.brand === filters.brand);
  const selectedChainStores = (dashboard?.chainStores ?? []).filter((row: any) => filters.chain === "all" || row.chainId === filters.chain);
  const selectedStoreProducts = (dashboard?.storeProducts ?? []).filter((row: any) => filters.store === "all" || row.storeId === filters.store);
  const selectedProductChains = (dashboard?.productChains ?? []).filter((row: any) => filters.product === "all" || row.productId === filters.product);
  const selectedProductStores = (dashboard?.productStores ?? []).filter((row: any) => filters.product === "all" || row.productId === filters.product);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">East Asian Traders</p>
          <h1>Order and Delivery Tracking Dashboard</h1>
        </div>
        <div className="status-pill">{dashboard?.summary?.lastUpdated ? `Last updated ${new Date(dashboard.summary.lastUpdated).toLocaleString()}` : "Seed data loaded"}</div>
      </header>

      <section className="filters" aria-label="Dashboard filters">
        <label>
          Month
          <input type="month" value={filters.month} onChange={(event) => setFilter("month", event.target.value)} />
        </label>
        <label>
          Week
          <select value={filters.week} onChange={(event) => setFilter("week", event.target.value)}>
            <option value="all">All weeks</option>
            {[1, 2, 3, 4, 5].map((week) => <option key={week} value={week}>Week {week}</option>)}
          </select>
        </label>
        <label>
          Status
          <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All statuses</option>
          </select>
        </label>
        <label>
          Channel
          <select value={filters.channel} onChange={(event) => setFilter("channel", event.target.value)}>{optionList(options.channels, "All channels")}</select>
        </label>
        <label>
          Chain
          <select value={filters.chain} onChange={(event) => setFilter("chain", event.target.value)}>{optionList(chains, "All chains")}</select>
        </label>
        <label>
          Store
          <select value={filters.store} onChange={(event) => setFilter("store", event.target.value)}>{optionList(stores, "All stores")}</select>
        </label>
        <label>
          Brand
          <select value={filters.brand} onChange={(event) => setFilter("brand", event.target.value)}>{optionList(options.brands, "All brands")}</select>
        </label>
        <label>
          Product
          <select value={filters.product} onChange={(event) => setFilter("product", event.target.value)}>{optionList(products, "All products")}</select>
        </label>
        <label className="search">
          Search
          <input value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Delivery, store, chain, product..." />
        </label>
      </section>

      <nav className="tabs" aria-label="Main views">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>

      {message && <div className="notice">{message}</div>}
      {loading && <div className="empty">Loading live delivery data...</div>}

      {!loading && dashboard && activeTab === "Overview" && (
        <section className="view">
          <div className="cards">
            {[
              ["Deliveries", dashboard.summary.deliveries],
              ["Units", dashboard.summary.units],
              ["Chains", dashboard.summary.chains],
              ["Stores", dashboard.summary.stores],
              ["Products", dashboard.summary.products],
              ["Avg units/delivery", dashboard.summary.averageUnits],
            ].map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong>{formatNumber(Number(value))}</strong>
              </div>
            ))}
          </div>

          <div className="section-head">
            <h2>Weekly Breakdown</h2>
            <div className="export-row">
              {exportTables.map((table) => <a key={table} href={`/api/export?table=${table}&${query}`}>Export {table}</a>)}
            </div>
          </div>
          <DataTable rows={dashboard.weekly} columns={[["Week", (row) => `Week ${row.week}`], ["Deliveries", "deliveries"], ["Units", (row) => formatNumber(row.units)]]} empty="No deliveries for this month." />

          <div className="grid-two">
            <section>
              <h2>Channel Breakdown</h2>
              <DataTable rows={dashboard.channels} columns={[["Channel", "name"], ["Deliveries", "deliveries"], ["Units", (row) => formatNumber(row.units)], ["Chains", "chains"], ["Stores", "stores"]]} />
            </section>
            <section>
              <h2>Chain Breakdown</h2>
              <DataTable rows={dashboard.chains} columns={[["Chain", "name"], ["Channel", "channel"], ["Deliveries", "deliveries"], ["Units", (row) => formatNumber(row.units)], ["Stores", "stores"], ["Products", "products"]]} />
            </section>
            <section>
              <h2>Store Breakdown</h2>
              <DataTable rows={dashboard.stores} columns={[["Store", "name"], ["Chain", "chain"], ["Location", "location"], ["Deliveries", "deliveries"], ["Units", (row) => formatNumber(row.units)], ["Products", "products"]]} />
            </section>
            <section>
              <h2>Product Breakdown</h2>
              <DataTable rows={dashboard.products} columns={[["Product", "name"], ["Brand", "brand"], ["Deliveries", "deliveries"], ["Units", (row) => formatNumber(row.units)], ["Chains", "chains"], ["Stores", "stores"]]} />
            </section>
          </div>
        </section>
      )}

      {activeTab === "Import" && (
        <section className="view">
          <form className="import-box" onSubmit={handlePreview}>
            <label>
              Delivery spreadsheet
              <input type="file" accept=".csv,.xlsx,.xls" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            </label>
            <a className="sample-link" href="/test_import_july_2026.csv">Download 20-row test CSV</a>
            <button type="submit">Preview Rows</button>
            <button type="button" disabled={!selectedFile} onClick={() => upload("import")}>Confirm Import</button>
          </form>
          {preview && (
            <section>
              <h2>Preview: {preview.fileName}</h2>
              <p>{preview.totalRows} rows found, {preview.invalidRows} currently invalid.</p>
              <DataTable rows={preview.preview} columns={[["Line", "source_line_number"], ["Delivery", "delivery_ref"], ["Date", "delivery_date"], ["Store", "store_code"], ["Product", "product_code"], ["Units", "units_delivered"], ["Status", "delivery_status"], ["Error", (row) => row.error_type ?? "Ready"]]} />
            </section>
          )}
          {importResult && (
            <section className="result">
              <h2>Import Result</h2>
              <div className="cards compact">
                {[
                  ["Processed", importResult.rowsProcessed],
                  ["Inserted", importResult.inserted],
                  ["Updated", importResult.updated],
                  ["Rejected", importResult.rejected],
                  ["Skipped", importResult.skipped],
                ].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
              <DataTable rows={importResult.exceptions ?? []} columns={[["Line", "source_line_number"], ["Delivery", "raw_delivery_ref"], ["Store", "raw_store_code"], ["Product", "raw_product_code"], ["Error", "error_type"], ["Message", "error_message"]]} empty="No rejected rows." />
            </section>
          )}
        </section>
      )}

      {!loading && dashboard && activeTab === "Drill-down" && (
        <section className="view">
          <div className="grid-two">
            <section>
              <h2>Chain to Store Weekly Matrix</h2>
              <Matrix rows={selectedChainStores} nameKey="store" />
            </section>
            <section>
              <h2>Store to Product Weekly Matrix</h2>
              <Matrix rows={selectedStoreProducts} nameKey="product" />
            </section>
            <section>
              <h2>Product to Chain Weekly Matrix</h2>
              <Matrix rows={selectedProductChains} nameKey="chain" />
            </section>
            <section>
              <h2>Product to Store Weekly Matrix</h2>
              <Matrix rows={selectedProductStores} nameKey="store" />
            </section>
          </div>
        </section>
      )}

      {!loading && dashboard && activeTab === "Records" && (
        <section className="view">
          <h2>Delivery-Level Detail</h2>
          <DataTable rows={dashboard.deliveryRecords} columns={[["Date", "date"], ["Reference", "ref"], ["Chain", "chain"], ["Store", "store"], ["Product", "product"], ["Code", "code"], ["Units", "units"], ["Status", "status"], ["Source Row", "sourceRowId"]]} />
        </section>
      )}

      {activeTab === "History" && (
        <section className="view grid-two">
          <section>
            <h2>Import History</h2>
            <DataTable rows={history?.logs ?? []} columns={[["File", "file_name"], ["Status", "import_status"], ["Processed", "rows_processed"], ["Inserted", "rows_inserted"], ["Updated", "rows_updated"], ["Rejected", "rows_rejected"], ["Skipped", "rows_skipped"], ["Completed", (row) => row.completed_at ? new Date(row.completed_at).toLocaleString() : "Pending"]]} empty="No imports yet." />
          </section>
          <section>
            <h2>Import Exceptions</h2>
            <DataTable rows={history?.exceptions ?? []} columns={[["Line", "source_line_number"], ["Delivery", "raw_delivery_ref"], ["Store", "raw_store_code"], ["Product", "raw_product_code"], ["Error", "error_type"], ["Message", "error_message"]]} empty="No exceptions yet." />
          </section>
        </section>
      )}

      {activeTab === "Master Data" && (
        <section className="view grid-two">
          <section><h2>Channels</h2><DataTable rows={history?.masterData?.channels ?? []} columns={[["Code", "channel_code"], ["Name", "channel_name"]]} /></section>
          <section><h2>Chains</h2><DataTable rows={history?.masterData?.chains ?? []} columns={[["Code", "chain_code"], ["Name", "chain_name"], ["Channel", (row) => row.channels?.channel_name ?? ""]]} /></section>
          <section><h2>Stores</h2><DataTable rows={history?.masterData?.stores ?? []} columns={[["Code", "store_code"], ["Store", "store_name"], ["Chain", (row) => row.chains?.chain_name ?? ""], ["Location", "location"], ["State", "state"]]} /></section>
          <section><h2>Products</h2><DataTable rows={history?.masterData?.products ?? []} columns={[["Code", "product_code"], ["Product", "product_name"], ["Brand", "brand"], ["SKU", "sku"]]} /></section>
        </section>
      )}
    </main>
  );
}
