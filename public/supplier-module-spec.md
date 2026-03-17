# Supplier Carbon Accounting Module — Full Specification

## 1. Data Model

```typescript
type TargetStatus = 
  | "sbti-validated" 
  | "sbti-validated-inherited" 
  | "sbti-committed" 
  | "non-sbti-validated" 
  | "non-sbti-committed" 
  | "non-sbti-inherited" 
  | "no-targets";

type SyncStatus = "synced" | "warning" | "not-synced";

type Methodology = "Organisation specific" | "Industry benchmark" | "Input by User";

type CalculationMethodology = "spend" | "tco2e";

interface Supplier {
  id: string;
  name: string;
  industry: string;
  description: string;
  tco2e: number;            // metric tonnes CO₂ equivalent
  spend: number;            // annual spend in GBP
  targetStatus: TargetStatus;
  cdp: boolean;
  category: string;         // GHG Protocol Scope 3 category
  synced: SyncStatus;
  emissionFactor: number;   // kgCO₂e per £
  methodology: Methodology;
  calculationMethodology: CalculationMethodology;
  hqCountry: string;        // ISO 3166-1 alpha-2 code
  website: string;
}

interface YearData {
  year: number;
  suppliers: Supplier[];
}
```

---

## 2. Table Columns

| # | Column | Key | Description | Always Visible | Default Visible |
|---|--------|-----|-------------|---------------|-----------------|
| 1 | **Name** | `name` | Legal entity name. Links to detail modal. Pencil icon opens edit modal. | ✅ | ✅ |
| 2 | **Company HQ** | `hq` | Country flag image (20×15px) from `flagcdn.com/{code}.png` | No | ✅ |
| 3 | **tCO₂e** | `tco2e` | Numeric, 2 decimal places, monospace font. Shows warning icon if `synced === "not-synced"` and `calculationMethodology === "spend"` | No | ✅ |
| 4 | **Spend on Supplier** | `spend` | Numeric with locale formatting (comma separators) | No | ✅ |
| 5 | **Targets** | `targets` | Colored pill (see §3). Shows `"-"` if `synced === "not-synced"` | No | ✅ |
| 6 | **CDP** | `cdp` | Icon (see §4). Shows `"-"` if `synced === "not-synced"` | No | ✅ |
| 7 | **Category** | `category` | Text, truncated at 160px max-width | No | ✅ |
| 8 | **Calc. Methodology** | `calcMethod` | Pill (see §5) | No | ❌ (hidden) |
| 9 | **Spend Factor Type** | `spendFactorType` | Pill (see §6). Shows `"-"` if `calculationMethodology === "tco2e"` | No | ❌ (hidden) |
| 10 | **Synced** | `synced` | Icon (see §7). Shows spinning loader during sync | No | ✅ |

---

## 3. Targets Column — Pill System

Each status renders as a single **rounded-full pill** with text, optional icon, and colored background/text/border.

| Status Value | Pill Text | Color | Arrow Icon | Tooltip |
|---|---|---|---|---|
| `sbti-validated` | **SBTi** | 🟢 Green | No | "Supplier has SBTi Validated Targets" |
| `sbti-committed` | **SBTi** | 🟠 Orange | No | "Supplier has committed to set SBTi Targets" |
| `sbti-validated-inherited` | **SBTi** | 🔵 Blue | ✅ `ArrowUpRight` (9px, strokeWidth 3) | "Supplier has SBTi Validated Targets (inherited from parent company)" |
| `non-sbti-validated` | **Other** | 🟢 Green | No | "Supplier has validated non-SBTi targets" |
| `non-sbti-committed` | **Other** | 🟠 Orange | No | "Supplier has committed to non-SBTi targets" |
| `non-sbti-inherited` | **Other** | 🔵 Blue | ✅ `ArrowUpRight` | "Supplier has non-SBTi targets (inherited from parent company)" |
| `no-targets` | **None** | 🔴 Red | No | "Company has no public targets" |

**Pill styling:** `text-[10px] font-semibold px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1`

**Fallback:** Unknown/legacy values default to `no-targets` config.

**Header legend (4 items):**
- 🟢 pill "SBTi" → "Validated"
- 🟠 pill "SBTi" → "Committed"
- 🔵 pill "SBTi" + arrow → "Inherited"
- 🔴 pill "None" → "No Targets"

---

## 4. CDP Column — Icon System

| Value | Icon | Color | Tooltip |
|---|---|---|---|
| `true` | `CheckCircle2` (16px) | Green | "Organisation has reported to CDP" |
| `false` | `XCircle` (16px) | Red (60% opacity) | "Organisation has not reported to CDP" |

**Header legend:**
- ✅ CheckCircle2 → "Reported to CDP"
- ❌ XCircle → "Not reported"

---

## 5. Calc. Methodology Column — Pill System

| Value | Pill Text | Style |
|---|---|---|
| `"spend"` | "Spend Data Input" | Neutral bg (secondary), foreground text |
| `"tco2e"` | "CO₂e Data Input" | Accent bg (10% opacity), accent text |

**Pill styling:** `text-xs font-medium px-2 py-0.5 rounded-full`

**Header legend:**
- Neutral pill "Spend" → "Spend Data Input"
- Accent pill "CO₂e" → "CO₂e Data Input"

---

## 6. Spend Factor Type Column — Pill System

Only shown when `calculationMethodology === "spend"`. Otherwise shows `"-"`.

| Condition | Pill Text | Style |
|---|---|---|
| `methodology !== "Input by User"` | "AI Generated" | Neutral bg (secondary), foreground text |
| `methodology === "Input by User"` | "Custom" | Amber bg (10% opacity), amber text |

**Header legend:**
- Neutral pill "AI" → "AI Generated"
- Amber pill "Custom" → "User Input"

---

## 7. Synced Column — Icon System

| Value | Icon | Color | Tooltip |
|---|---|---|---|
| `"synced"` | `CheckCircle2` (16px) | Green | "AI successfully found data" |
| `"warning"` | `AlertTriangle` (16px) | Amber/Yellow | "AI couldn't be sure which company this is" |
| `"not-synced"` | `XCircle` (16px) | Red | "AI could not sync company data." |

**Loading state:** When a supplier is being synced (after add), show `Loader2` (16px) with `animate-spin` class. Sync takes 5 seconds.

**Header legend:**
- ✅ CheckCircle2 → "AI found data"
- ⚠️ AlertTriangle → "Uncertain match"
- ❌ XCircle → "Could not sync"

---

## 8. Column Header Tooltips

Every column header has:
- The column label text
- An **info icon** (`Info`, 12px, 40% opacity, 100% on hover)
- A tooltip that appears on hover (instant, `delayDuration={0}`) containing:
  - **Description text** — explains the column
  - **Legend section** (for icon/pill columns only) — separated by a top border, showing each visual indicator with its label

| Column | Tooltip Description |
|---|---|
| Name | "Legal entity name of the supplier in your procurement system." |
| Company HQ | "Country where the supplier's headquarters is located." |
| tCO₂e | "Total metric tonnes of CO2 equivalent emissions attributed to this supplier." |
| Spend on Supplier | "Total annual procurement spend with this supplier in USD." |
| Targets | "Whether the supplier has set science-based or net-zero emission reduction targets." |
| CDP | "Whether the supplier discloses environmental data through the CDP (formerly Carbon Disclosure Project)." |
| Category | "GHG Protocol Scope 3 category classification for this supplier's emissions." |
| Calc. Methodology | "Whether emissions are calculated from spend data or directly from CO₂e data provided by the supplier." |
| Spend Factor Type | "Whether the emission factor used is AI-generated or a custom value entered by the user. Only applicable to spend-based calculations." |
| Synced | "Whether emission data is synced with the supplier's latest disclosure." |

---

## 9. Conditional Cell Display (Synced Dependency)

When `synced === "not-synced"`:
- **tCO₂e cell** (if `calculationMethodology === "spend"`): Shows `AlertTriangle` icon (red) with tooltip: "No Emission Factor available as AI was not able to synch the company."
- **Targets cell**: Shows `"-"` in muted text
- **CDP cell**: Shows `"-"` in muted text

---

## 10. Filter Bar

Positioned above the table. All filters are `<select>` dropdowns with an initial empty/placeholder option.

| Filter | Options |
|---|---|
| **Search** | Text input with search icon, filters by supplier name (case-insensitive) |
| **Company HQ** | Dynamic — all unique country codes from current year's data |
| **Targets** | SBTi Validated, SBTi Inherited, SBTi Committed, Other Validated, Other Committed, Other Inherited, No Targets |
| **CDP** | Yes, No, Empty |
| **Category** | Dynamic — all unique categories from current year's data |
| **Synced** | Yes, No |
| **Calc. Methodology** | Spend Data Input, CO₂e Data Input |
| **Spend Factor Type** | AI Generated, Custom |

A **"Clear" button** (with X icon) appears when any filter is active.

---

## 11. Column Visibility Toggle

- Gear icon (`Settings`, 15px) opens a popover
- Shows all columns except "Name" as checkboxes in a 2-column grid
- **Default hidden:** Calc. Methodology, Spend Factor Type
- Toggling a column immediately shows/hides it in the table

---

## 12. Year Selector

- Dropdown showing all years (sorted descending)
- "Add new year" option at bottom (creates next sequential year with empty suppliers)
- **"Copy last year's suppliers"** button — only visible when current year has 0 suppliers
  - Opens a modal to select which suppliers to copy
  - Copied suppliers have `spend` and `tco2e` reset to 0

---

## 13. Add Supplier Flow

**Modal fields:**
- Name* — text input
- Geography* (Company HQ) — dropdown of countries
- Category* — dropdown of GHG Scope 3 categories
- Email — text input (optional)
- Phone — text input (optional)
- URL — text input (optional)
- Calculation method* — two-option card selector:
  - "I have spend data" (DollarSign icon) — requires Spend field
  - "I have CO₂e data" (Cloud icon) — requires tCO₂e field
- Spend on Supplier — number input with "GBP" suffix
- tCO₂e — number input (disabled when spend method selected)

**On save:**
1. Supplier added with `synced: "not-synced"`, `emissionFactor: 0`
2. Spinning loader shown in Synced column for 5 seconds
3. After 5 seconds: `synced` set to `"synced"`, random emission factor generated, tCO₂e calculated as `spend × emissionFactor`
4. Success toast shown

---

## 14. Edit Supplier Flow

**Two-tab modal:**

### Tab 1: "{Year} Data"
- CO₂e Calculation section:
  - If `calculationMethodology === "tco2e"`: direct tCO₂e input + optional spend
  - If `calculationMethodology === "spend"`: spend input + factor source selection:
    - "AI Generated Factor" (Sparkles icon) — emission factor & methodology are read-only
    - "Use Your Own Factor" (PenLine icon) — emission factor is editable, methodology locked to "Input by User"
  - Calculated tCO₂e shown as read-only (`spend × emissionFactor`)
- Reporting & Targets section:
  - Targets dropdown (all 7 options)
  - CDP dropdown (Yes/No)
  - **Override confirmation:** If supplier is `synced === "synced"` and user changes Targets or CDP from the AI-synced value, an AlertDialog asks: "This will replace the AI sync value for {field}. Continue?"

### Tab 2: "Supplier Data"
- Name, Company HQ (read-only), Industry (read-only), Website, Description (textarea)
- Calculation Methodology shown as read-only

**Validation:** Spend required if spend-based; tCO₂e required if tco2e-based. Red ring + error message on invalid fields.

---

## 15. Detail Modal (Read-Only)

Triggered by clicking supplier name. Shows:
- Header: Name + Globe icon (links to website) + flag + industry
- Description section
- Methodology label ("Spend Data Input" or "CO₂e Data Input")
- If spend-based:
  - Emission Factor / £ (3 decimal places, "kgCO₂e" suffix)
  - Spend Factor Type badge (Organisation specific / Industry benchmark / Input by User)

---

## 16. Bulk Upload Modal

- Download CSV template button (headers: Name, Company HQ, Category, Email, Phone, URL, Spend, tCO₂e)
- Drag-and-drop file zone (accepts .csv, .xlsx, .xls)
- Upload button

---

## 17. Action Bar Buttons

| Button | Position | Behaviour |
|---|---|---|
| Settings (gear icon) | Left | Opens column visibility popover |
| Year dropdown | Left | Selects active year |
| Copy last year | Left (conditional) | Only shows when current year is empty |
| **ADD** + dropdown | Right | Primary: opens Add Supplier modal. Dropdown: "Bulk Upload" |
| **Download** | Right | Download button (placeholder) |

---

## 18. Lucide Icons Used

| Icon Name | Where Used | Size |
|---|---|---|
| `Info` | Column header tooltip triggers | 12px |
| `CheckCircle2` | CDP ✅, Synced ✅ | 16px (cell), 12px (legend) |
| `XCircle` | CDP ❌, Synced ❌ | 16px (cell), 12px (legend) |
| `AlertTriangle` | Synced ⚠️, tCO₂e warning | 16px (cell), 12px (legend) |
| `ArrowUpRight` | Target inherited pill | 9px (strokeWidth 3) |
| `Pencil` | Edit button next to name | 13px |
| `Search` | Search filter input | 14px |
| `X` | Clear filters, close modals | 13-16px |
| `Plus` | Add supplier, Add year | 14px |
| `Copy` | Copy last year button | 14px |
| `ChevronDown` | Year dropdown, Add dropdown | 14px |
| `Loader2` | Sync spinner | 16px (`animate-spin`) |
| `Download` | Download button, template download | 14px |
| `Upload` | Bulk upload | 14px, 28px |
| `Settings` | Column toggle gear | 15px |
| `Globe` | Website link in detail modal | 15px |
| `DollarSign` | Spend calc method card | 16px |
| `Cloud` | CO₂e calc method card | 16px |
| `Sparkles` | AI factor source card | 16px |
| `PenLine` | Custom factor source card | 16px |

---

## 19. Interaction Patterns

- **Tooltips:** All tooltips use `delayDuration={0}` (instant) and appear on `side="bottom"`
- **Table rows:** Hover highlight with 75ms transition
- **Modals:** Animated with framer-motion (fade + scale 0.98→1, 150ms, ease `[0.25, 0.1, 0.25, 1]`). Backdrop: 20% foreground colour + backdrop blur
- **Toast notifications:** Used for all user actions (add, edit, save, copy, sync complete, upload)
- **Name cell:** Pencil icon (left) → edit modal. Name text (right) → detail modal. Name has underline-on-hover
