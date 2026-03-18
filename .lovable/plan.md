

## Plan: Target Column Updates + New "SBT Aligned?" Column

### 1. Rename "Inherited" pill to "SBTi Inherited"
- In `targetStatusConfig`, change `pillText` from `"Inherited"` to `"SBTi Inherited"`
- Update the header legend text accordingly

### 2. Normalize icon sizes
- All icons in `targetStatusConfig` currently use `size={11}` — the `ArrowUpRight` also has `strokeWidth={3}` making it visually heavier. Will normalize all to `size={10}` and remove the extra strokeWidth so they look consistent inside the pills.

### 3. Add "SBT Aligned?" column

**Data model (`src/data/suppliers.ts`)**:
- Add `sbtAligned: boolean` field to `Supplier` interface
- Auto-derive default values in seed data based on `targetStatus`:
  - `sbti-validated` / `sbti-inherited` → `true`
  - `sbti-committed` / `no-targets` → `false`
  - `self-published` → `false` (default, but user-editable)

**Table column (`src/components/SupplierTable.tsx`)**:
- Add new column `sbtAligned` after `targets` in the `columns` array
- Column header: "SBT Aligned?" with tooltip: "Shows whether the supplier's targets are SBTi aligned."
- Legend: green CheckCircle2 = "SBTi Aligned", red XCircle = "Not Aligned"
- Cell rendering: `CheckCircle2` (green) for `true`, `XCircle` (red) for `false`
- For `self-published` suppliers: show an amber `AlertTriangle` icon with tooltip "Self-published targets — please verify SBTi alignment" to prompt the user to check/confirm
- When `synced === "not-synced"`: show `"-"`

**Edit modal (`src/components/SupplierEditModal.tsx`)**:
- Add "SBT Aligned" toggle/dropdown in the Reporting & Targets section
- Disabled (locked to Yes) for `sbti-validated` and `sbti-inherited`
- Disabled (locked to No) for `no-targets` and `sbti-committed`
- Editable only for `self-published` — with a note/hint: "Please verify whether self-published targets are SBTi aligned"

**Filter bar**:
- Add filter for "SBT Aligned?" with options: Yes, No

### Files to modify
1. `src/data/suppliers.ts` — add `sbtAligned` field + defaults
2. `src/components/SupplierTable.tsx` — rename pill, normalize icons, add column + filter + legend
3. `src/components/SupplierEditModal.tsx` — add SBT Aligned field with conditional editability
4. `src/components/AddSupplierModal.tsx` — auto-set `sbtAligned` based on target status selection

