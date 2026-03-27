

## Add Tabbed Layout with Insights Dashboard

### Overview
Add a two-tab layout ("Suppliers" and "Insight") above the current content. The Suppliers tab shows the existing table. The Insight tab shows a dashboard with summary KPI panels and charts derived from the supplier data.

### Tab Design (matching uploaded reference)
- Full-width tab bar with two tabs: "Suppliers" (table icon) and "Insight" (chart icon)
- Clean, minimal style matching the reference screenshot

### Insight Dashboard Content

**Top KPI Panels (3 cards matching reference)**
1. **No. of Suppliers** - white card, count of suppliers
2. **Total tCO2e** - dark navy card, sum of all tCO2e
3. **Suppliers /w Targets** - teal card, percentage with targets (excluding "no-targets")

**Charts Section**
- **tCO2e by Category** - horizontal bar chart
- **Spend by Supplier (Top 10)** - bar chart
- **Target Status Breakdown** - donut/pie chart
- **Calc Methodology Split** - pie chart

### Technical Approach

**Files to create:**
- `src/components/InsightDashboard.tsx` - new dashboard component with KPI panels and charts using Recharts (already in project)

**Files to modify:**
- `src/pages/Index.tsx` - add Radix Tabs wrapping Suppliers and Insight tabs
- Move year selector state up to Index so both tabs can share the selected year's data

The dashboard will compute all metrics from the same supplier data array, keeping everything consistent.

