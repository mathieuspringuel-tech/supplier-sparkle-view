

## Add Re-Sync Button

### What
Add a "Re-Sync" button to the left of the existing "Download" button in the toolbar. It will have a tooltip saying "This will pull the most recent data." When clicked, all supplier Status icons briefly show a loading spinner (~1 second), then revert to their original status.

### Technical approach

**File: `src/components/SupplierTable.tsx`**

1. **Add state**: `const [isSyncing, setIsSyncing] = useState(false);`
2. **Add handler**: `handleResync` sets `isSyncing = true`, then after ~1.2s timeout sets it back to `false`.
3. **Add button**: Inside the `ml-auto` div (line 649), before the Download button, add a `RefreshCw` icon button wrapped in a `Tooltip` with text "This will pull the most recent data."
4. **Status column**: When `isSyncing` is true, render a `Loader2` spinner (with animate-spin) for every row's status cell instead of the normal icon.

Import additions: `RefreshCw` from lucide-react, `Tooltip`/`TooltipTrigger`/`TooltipContent`/`TooltipProvider` from UI components.

