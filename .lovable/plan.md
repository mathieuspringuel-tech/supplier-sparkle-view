

## Target Status Pill Redesign

### Understanding

The Targets column currently uses icons (Target/XCircle) + optional text badges. We're replacing this with a **pill-only** system. There are now **7 statuses** (current type only has 5), so we need to expand the `TargetStatus` union.

### Full Pill Mapping

| Status | Pill Text | Color | Arrow? |
|---|---|---|---|
| `sbti-validated` | SBTi | Green | No |
| `sbti-committed` | SBTi | Orange | No |
| `sbti-validated-inherited` | SBTi | Blue | Yes |
| `non-sbti-validated` | Other | Green | No |
| `non-sbti-committed` | Other | Orange | No |
| `non-sbti-inherited` | Other | Blue | Yes |
| `no-targets` | None | Red | No |

### Changes

**1. `src/data/suppliers.ts`** — Expand `TargetStatus` union to add `"non-sbti-validated"`, `"non-sbti-committed"`, `"non-sbti-inherited"`. Update existing `"non-sbti"` references in seed data to use the new specific statuses.

**2. `src/components/SupplierTable.tsx`** — Rewrite `targetStatusConfig` and `TargetStatusCell`:
- Config becomes 7 entries with `pillText` ("SBTi" / "Other" / "None"), `color` (green/orange/blue/red), and optional `inherited` flag
- Cell renderer: single pill `<span>` with `rounded-full`, colored bg/text/border using existing theme tokens. Arrow icon rendered inside the pill for inherited variants. No more Target/XCircle icons.

**3. `src/components/SupplierEditModal.tsx`** — Update the target status dropdown options to include all 7 statuses.

**4. Filter dropdown** in `SupplierTable.tsx` — Update the Targets filter options to reflect the new 7 statuses.

