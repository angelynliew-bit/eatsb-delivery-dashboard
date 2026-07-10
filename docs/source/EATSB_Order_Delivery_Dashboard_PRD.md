# Product Requirements Document

## Order and Delivery Tracking Dashboard

**Prepared for:** East Asian Traders Sdn Bhd  
**Version:** 1.0  
**Date:** 10 July 2026  
**Status:** Initial Product Requirements Document

---

## 1. Product Overview

### 1.1 Product Name

**Working name:** Order and Delivery Tracking Dashboard

### 1.2 Background

East Asian Traders currently tracks deliveries using a physical whiteboard. This method allows the company to review only one retail chain at a time and does not provide a consolidated view across:

- Sales channels
- Retail chains
- Individual stores
- Products
- Weeks
- Months

This makes it difficult to identify product demand patterns, understand delivery frequency, and plan inventory accurately. The company sometimes runs out of stock because it lacks timely visibility of product movement.

### 1.3 Proposed Solution

Develop a simple internal system that:

1. Reads delivery data from a spreadsheet.
2. Validates and imports the data into a central database.
3. Updates the dashboard daily from Monday to Saturday.
4. Displays weekly and monthly delivery information.
5. Supports drill-down analysis by channel, chain, store, and product.
6. Tracks both:
   - Number of deliveries made
   - Number of individual units delivered
7. Provides a foundation for future inventory planning and forecasting.

---

## 2. Product Objectives

The system should:

- Replace the physical whiteboard as the main delivery-monitoring tool.
- Consolidate all chains and stores into one dashboard.
- Show delivery activity by week and month.
- Track individual units rather than cartons.
- Show how frequently each store receives deliveries.
- Show which products are delivered to each chain and store.
- Show which chains and stores receive each product.
- Improve visibility of product movement.
- Support better inventory purchasing and replenishment decisions.
- Reduce the risk of running out of stock.
- Minimise manual calculations and duplicate reporting work.

---

## 3. Scope

### 3.1 In Scope for MVP

- Spreadsheet-based source data
- Daily spreadsheet import
- Data validation
- Duplicate detection
- Central delivery database
- Monthly dashboard
- Weekly delivery breakdown
- Channel analysis
- Chain analysis
- Store analysis
- Product analysis
- Product → Chain → Store drill-down
- Chain → Store → Product drill-down
- Delivery counts
- Individual units delivered
- Search and filtering
- Import error reporting
- Last-updated timestamp
- CSV or Excel export

### 3.2 Future Scope

- Current inventory levels
- Incoming supplier purchase orders
- Stock-on-hand calculations
- Weeks of stock cover
- Low-stock warnings
- Reorder suggestions
- Supplier lead-time tracking
- Safety stock calculations
- Product expiry tracking
- Promotion and seasonal adjustments
- Automated alerts
- Direct integration with accounting or inventory software
- Predictive demand forecasting

### 3.3 Out of Scope for MVP

- Full accounting functionality
- Invoice generation
- Customer payment tracking
- Route planning
- Driver management
- Warehouse picking
- Supplier purchase-order management
- AI forecasting
- Replacement of the existing spreadsheet entry process

---

## 4. Users

### Business Owner or Management

Needs to:

- Review monthly delivery performance
- Compare channels and chains
- Identify high-demand products
- Identify high-volume stores
- Monitor weekly changes
- Plan stock purchases

### Administrative or Operations Staff

Needs to:

- Maintain the source spreadsheet
- Check whether daily data has been imported
- Correct invalid records
- Review duplicates or missing information
- Search delivery records

### Sales or Merchandising Staff

May need to:

- Review store delivery history
- Identify stores that have not received deliveries
- Review product distribution by chain
- Compare activity across outlets

---

## 5. Definitions

### 5.1 Order

A customer purchase order or confirmed request for products.

An order may contain one or more products and may be fulfilled in one or more deliveries.

### 5.2 Delivery

One physical delivery transaction identified by a unique delivery reference.

A delivery may contain multiple product line items.

### 5.3 Delivery Count

The number of unique completed delivery transactions.

A delivery containing several products counts as one delivery at overall, channel, chain, and store level.

### 5.4 Product Delivery Count

When analysing a specific product, the product is counted once within a delivery reference, regardless of the number of spreadsheet rows used for that product.

### 5.5 Individual Units Delivered

The total number of saleable product units delivered.

The system will not use cartons as the primary reporting measure.

### 5.6 Channel

The broad customer category, such as:

- Supermarket
- Convenience store
- Independent grocer
- E-commerce
- Wholesale
- Distributor
- Corporate customer

### 5.7 Chain

A retail organisation operating one or more stores.

### 5.8 Store

An individual outlet or delivery location belonging to a chain.

Each store must have a unique store code.

### 5.9 Product

A specific sellable SKU identified by a unique product code.

---

## 6. Reporting Periods

### 6.1 Monthly Reporting

The default reporting period is the selected calendar month.

### 6.2 Weekly Reporting Within a Month

| Week | Dates |
|---|---|
| Week 1 | 1st–7th |
| Week 2 | 8th–14th |
| Week 3 | 15th–21st |
| Week 4 | 22nd–28th |
| Week 5 | 29th–end of month |

### 6.3 Reporting Date

Weekly and monthly delivery figures are calculated using the actual delivery date.

---

## 7. Dashboard Information Architecture

```text
Overall Monthly Dashboard
├── By Week
├── By Channel
│   └── By Chain
│       └── By Store
│           └── By Product
├── By Chain
│   └── By Store
│       └── By Product
└── By Product
    └── By Chain
        └── By Store
```

The two principal analysis paths are:

1. Product → Chain → Store
2. Chain → Store → Product

---

## 8. Main Dashboard Requirements

### 8.1 Monthly Summary Cards

Display:

- Total unique deliveries
- Total units delivered
- Chains served
- Stores served
- Products delivered
- Average units per delivery
- Last successful update date and time

### 8.2 Weekly Summary

| Week | Deliveries | Units Delivered |
|---|---:|---:|
| Week 1 |  |  |
| Week 2 |  |  |
| Week 3 |  |  |
| Week 4 |  |  |
| Week 5 |  |  |
| Total |  |  |

The dashboard may also display a chart with a toggle between deliveries and units.

### 8.3 Channel Breakdown

| Channel | Deliveries | Units Delivered | Chains | Stores |
|---|---:|---:|---:|---:|

### 8.4 Chain Breakdown

| Chain | Channel | Deliveries | Units Delivered | Stores Served | Products Delivered |
|---|---|---:|---:|---:|---:|

### 8.5 Store Breakdown

| Store Name | Chain | Location | Deliveries | Units Delivered | Products Delivered |
|---|---|---|---:|---:|---:|

### 8.6 Product Breakdown

| Product | Brand | Deliveries | Units Delivered | Chains | Stores |
|---|---|---:|---:|---:|---:|

---

## 9. Chain → Store → Product Drill-Down

### 9.1 Purpose

This view shows:

- Which stores received deliveries
- How frequently each store received deliveries
- How many units each store received
- Which products were delivered to each store
- Weekly and monthly product volume by store

### 9.2 Drill-Down Path

```text
Month
→ Channel, where applicable
→ Chain
→ Store
→ Product
→ Delivery records
```

### 9.3 Chain Summary

Display:

- Total deliveries
- Total units delivered
- Stores served
- Products delivered
- Average units per delivery
- Highest-volume store
- Most-delivered product

### 9.4 Chain by Store Table

Required columns:

| Month | Store Name | Location | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Total |
|---|---|---|---|---|---|---|---|---|

Each weekly cell must show:

- Number of deliveries
- Number of individual units delivered

Example:

```text
2 deliveries
120 units
```

The figures in this table include all products delivered to the store.

### 9.5 Store by Product Table

Required columns:

| Product | SKU | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Total |
|---|---|---|---|---|---|---|---|

Each weekly cell must show:

- Number of unique deliveries containing the product
- Number of units of that product delivered

### 9.6 Delivery-Level Detail

Required columns:

| Delivery Date | Delivery Reference | Product | Units Delivered |
|---|---|---|---:|

Optional columns:

- Order number
- Delivery status
- Invoice number
- Customer reference
- Entered by
- Source spreadsheet row

---

## 10. Product → Chain → Store Drill-Down

### 10.1 Purpose

This view shows:

- Which chains received the product
- Which stores received the product
- How frequently the product was delivered
- How many units were delivered
- Where demand is strongest or declining

### 10.2 Drill-Down Path

```text
Month
→ Product
→ Chain
→ Store
→ Delivery records
```

### 10.3 Product Summary

Display:

- Total product deliveries
- Total product units delivered
- Chains served
- Stores served
- Average units per delivery
- Highest-volume chain
- Highest-volume store

### 10.4 Product by Chain Table

| Chain | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Total |
|---|---|---|---|---|---|---|

Each weekly cell must show:

- Number of deliveries containing the selected product
- Units of the selected product delivered

### 10.5 Product by Chain by Store Table

| Month | Store Name | Location | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Total |
|---|---|---|---|---|---|---|---|---|

Only data for the selected product must be included.

---

## 11. Delivery Counting Rules

Example delivery:

| Delivery Reference | Product | Units |
|---|---|---:|
| DO-1008 | 7D Dried Mangoes 100g | 24 |
| DO-1008 | Sina Original 56g | 18 |
| DO-1008 | 7D Mango Thins 80g | 12 |

At store level:

```text
1 delivery
54 units
```

At product level:

| Product | Deliveries | Units |
|---|---:|---:|
| 7D Dried Mangoes 100g | 1 | 24 |
| Sina Original 56g | 1 | 18 |
| 7D Mango Thins 80g | 1 | 12 |

If the same product appears more than once in one delivery, count one product delivery and sum all units.

---

## 12. Dashboard Filters

Include:

- Month
- Date range
- Week
- Channel
- Chain
- Store
- Location
- State
- Brand
- Product
- SKU
- Delivery status

Linked filter behaviour:

- Channel limits chain options
- Chain limits store options
- Brand limits product options

Default filters:

- Current month
- Completed deliveries
- All channels, chains, stores, and products

---

## 13. Spreadsheet Requirements

Use one row per delivery product line.

Required or recommended columns:

| Field | Required |
|---|---|
| Delivery reference | Yes |
| Delivery date | Yes |
| Order number | Recommended |
| Channel | Yes |
| Chain code | Recommended |
| Chain name | Yes |
| Store code | Yes |
| Store name | Yes |
| Location | Yes |
| State | Recommended |
| Product code | Yes |
| Product name | Yes |
| Brand | Recommended |
| Units delivered | Yes |
| Delivery status | Yes |
| Source row ID | Recommended |
| Last modified date | Recommended |

Calculated by the system:

- Delivery month
- Delivery year
- Reporting week
- Import timestamp
- Last system update
- Validation status

Store and product codes are authoritative.

---

## 14. Data Validation

Block a row when:

- Delivery reference is missing
- Delivery date is invalid
- Store code is missing
- Store is unknown
- Product code is missing
- Product is unknown
- Units delivered is non-numeric
- Units delivered is negative
- Delivery status is invalid
- Chain-store relationship is invalid
- Channel-chain relationship is invalid

Warnings may be created when:

- State is blank
- Brand is blank
- Order number is missing
- Store or product name differs from master data

---

## 15. Duplicate Detection and Update Logic

Preferred unique row key:

```text
Source Row ID
```

Fallback key:

```text
Delivery Reference + Product Code + Line Number
```

Each update must:

- Insert new records
- Update changed records
- Ignore unchanged records
- Flag cancelled records
- Prevent duplicates
- Record import date and time

Deleted spreadsheet rows should be flagged for review rather than automatically permanently deleted.

---

## 16. Daily Update Process

The system should update Monday to Saturday.

Workflow:

1. Staff update the spreadsheet.
2. The system reads the spreadsheet.
3. New and changed rows are identified.
4. Data is validated.
5. Valid records are inserted or updated.
6. Invalid records are added to an exception report.
7. Dashboard data is refreshed.
8. The latest successful update timestamp is recorded.

The dashboard must show:

- Rows processed
- Rows inserted
- Rows updated
- Rows rejected
- Warnings
- Import status

---

## 17. Data Model

Core tables:

- `profiles`
- `channels`
- `chains`
- `stores`
- `products`
- `orders`
- `deliveries`
- `delivery_items`
- `import_logs`
- `import_exceptions`
- `audit_logs`

Important relationships:

- Channel has many chains
- Chain has many stores
- Store has many deliveries
- Delivery has many delivery items
- Product has many delivery items

---

## 18. Calculations

### Total Units Delivered

```text
Sum of units_delivered
```

### Total Deliveries

```text
Count of unique completed delivery references
```

### Product Delivery Count

```text
Count of unique delivery references containing the selected product
```

### Average Units per Delivery

```text
Total units delivered ÷ unique deliveries
```

### Stores Served

```text
Count of unique stores with at least one completed delivery
```

### Chains Served

```text
Count of unique chains with at least one completed delivery
```

### Products Delivered

```text
Count of unique products with units delivered greater than zero
```

---

## 19. Recommended Screens

1. Overview
2. Channel Analysis
3. Chain Analysis
4. Product Analysis
5. Store Analysis
6. Delivery Records
7. Spreadsheet Import
8. Import History
9. Import Exceptions
10. Master Data
11. User Management
12. Settings

---

## 20. Search, Sorting, and Export

Search by:

- Delivery reference
- Order number
- Store name
- Store code
- Chain name
- Product name
- Product code
- Location

Sort by:

- Store name
- Location
- Number of deliveries
- Number of units
- Product name
- Chain name
- Weekly figures
- Monthly total

Export filtered tables to CSV or Excel.

Exports must contain separate delivery and unit columns.

---

## 21. User Roles

### Administrator

Full access, including master data and users.

### Management

View dashboards, drill down, export, and view import status.

### Operations

Upload spreadsheets, review imports and exceptions, and view dashboards.

### Read-Only

View dashboards and drill-down details.

---

## 22. Non-Functional Requirements

- Secure login
- Role-based access
- Responsive desktop, laptop, and tablet layout
- Clear loading, empty, and error states
- Main dashboard target load time: under 5 seconds
- Filter response target: under 3 seconds
- Historical records retained
- Failed imports must not corrupt existing data
- Significant changes recorded in audit logs

---

## 23. Inventory Planning Foundation

The MVP must collect accurate units delivered by SKU over time.

Future calculation:

```text
Weeks of stock cover =
Current available stock ÷ average weekly units delivered
```

Future reorder calculation:

```text
Suggested reorder quantity =
Forecast demand during lead time
+ safety stock
− current available stock
− confirmed incoming stock
```

---

## 24. MVP Acceptance Criteria

The MVP is complete when:

- Users can sign in.
- Roles restrict access correctly.
- Authorised users can upload spreadsheets.
- The system previews and validates rows.
- Unknown stores and products are rejected.
- Re-importing the same file does not duplicate deliveries.
- Changed rows update existing records.
- The dashboard reports individual units, not cartons.
- Completed deliveries are counted using unique delivery references.
- Multi-product deliveries count once at store and chain level.
- Product delivery counts are calculated correctly.
- Week 1 through Week 5 are displayed.
- Chain Analysis supports Chain → Store → Product.
- Product Analysis supports Product → Chain → Store.
- Underlying delivery records can be viewed.
- Filters work correctly.
- Exports match active filters.
- Import logs and exceptions are visible.

---

## 25. Risks and Controls

| Risk | Control |
|---|---|
| Inconsistent store names | Use permanent store codes |
| Inconsistent product names | Use permanent SKU codes |
| Repeated imports | Use unique source row IDs and upsert logic |
| Missing delivery reference | Make it mandatory |
| Multi-product overcounting | Count distinct delivery references |
| Staff enter cartons | Define and validate individual units |
| Deleted spreadsheet rows | Flag for review |
| Incorrect chain-store mapping | Use controlled master data |
| Late updates | Show last-updated timestamp |
| Weak historical data | Validate and clean source data |

---

## 26. Recommended Development Sequence

### Phase 1: Data Preparation

- Finalise spreadsheet columns
- Create channel, chain, store, and product masters
- Assign unique codes
- Clean historical data

### Phase 2: Database and Import

- Build database tables
- Build importer
- Add validation
- Add duplicate prevention
- Add import logs and exceptions

### Phase 3: Core Dashboard

- Monthly summary
- Weekly breakdown
- Channel, chain, store, and product tables

### Phase 4: Drill-Down Views

- Chain → Store → Product
- Product → Chain → Store
- Delivery-level detail
- Linked filters

### Phase 5: Testing

- Multi-product deliveries
- Partial deliveries
- Cancelled deliveries
- Duplicate imports
- Missing master codes
- Reconciliation against spreadsheet totals

### Phase 6: Inventory Module

- Import current stock
- Import incoming stock
- Calculate average weekly movement
- Calculate stock cover
- Add low-stock alerts
- Add reorder suggestions

---

## 27. Final Product Statement

The Order and Delivery Tracking Dashboard will give East Asian Traders one consolidated view of customer deliveries across all channels, chains, stores, and products.

It will show:

- How many deliveries were made
- How many individual units were delivered
- Which products were delivered
- Which chains received them
- Which stores received them
- How delivery activity changed by week
- How delivery activity accumulated during the month

The system will provide a reliable operational base for inventory planning and help reduce stock shortages.
