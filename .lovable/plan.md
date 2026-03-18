

## Plan: Implement Option B — 5-Status Target Pills with Color + Icons

### Summary
Replace the current 7-status target system with 5 statuses, each having a unique icon + color-coded pill for maximum scannability.

### New Status Mapping

| Status | Pill Text | Icon | Color | Tooltip |
|--------|-----------|------|-------|---------|
| `sbti-validated` | SBTi Validated | `ShieldCheck` | Green | Supplier has SBTi Validated Targets |
| `sbti-committed` | SBTi Committed | `Clock` | Orange | Supplier has committed to set SBTi Targets |
| `sbti-inherited` | Inherited | `ArrowUpRight` | Blue | Targets inherited from parent company |
| `self-published` | Self Published | `FileText` | Grey/Neutral | Supplier has self-published targets |
| `no-targets` | No Targets | `Minus` | Red | No public targets found |

### Changes

**1. `src/data/suppliers.ts`**
- Update `TargetStatus` type to: `"sbti-validated" | "sbti-committed" | "sbti-inherited" | "self-published" | "no-targets"`
- Update seed data to use new status values (map old 7 statuses → new 5)

**2. `src/components/SupplierTable.tsx`**
- Replace `targetStatusConfig` with 5 entries, each including an icon component (`ShieldCheck`, `Clock`, `ArrowUpRight`, `FileText`, `Minus`)
- Update `TargetStatusCell` to render the icon inside the pill alongside text
- Update `getColumnLegends()` targets section with 5 legend entries using new icons
- Update filter `<select>` options to match 5 new statuses
- Add grey/neutral pill color class to `pillColorClasses`

**3. `src/index.css`**
- Add CSS variables for the new grey/neutral "self-published" pill color (e.g. `--target-self-published-bg/text/border`)

**4. `tailwind.config.ts`**
- Add `target-self-published` color tokens

**5. `src/components/AddSupplierModal.tsx` & `src/components/SupplierEditModal.tsx`**
- Update target status dropdowns to reflect 5 new options

**6. `public/supplier-module-spec.md`**
- Update spec to document new 5-status system

