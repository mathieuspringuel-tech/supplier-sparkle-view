

## Change: Yellow row highlight based on SBT Aligned "Unknown" instead of sync warning

**What changed:** The yellow row highlight should trigger when `sbtAligned === undefined` (Unknown), not when `synced === "warning"`.

**File:** `src/components/SupplierTable.tsx` (line ~571)

**Edit:** Replace the condition `s.synced === "warning"` with `s.sbtAligned === undefined && s.synced !== "not-synced"` in the row className. The not-synced check ensures red highlighting still takes priority for unsynced suppliers.

```
s.synced === "not-synced" 
  ? "bg-destructive/5 hover:bg-destructive/10" 
  : s.sbtAligned === undefined && s.synced !== "not-synced"
    ? "bg-amber-500/5 hover:bg-amber-500/10" 
    : "hover:bg-table-hover"
```

This is a single-line change in one file.

