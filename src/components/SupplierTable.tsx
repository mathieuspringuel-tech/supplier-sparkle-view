import { useState } from "react";
import { Info, CheckCircle2, XCircle, Plus, Copy, ChevronDown, Pencil, Loader2, Download, AlertTriangle, ArrowUpRight, Upload, Settings, Search, X, ShieldCheck, Clock, FileText, Minus, ExternalLink } from "lucide-react";
import type { TargetStatus } from "@/data/suppliers";
import { type Supplier, type YearData, initialYearData, getFlagUrl, deriveSbtAligned } from "@/data/suppliers";
import { SupplierModal } from "./SupplierModal";
import { SupplierEditModal } from "./SupplierEditModal";
import { CopyYearModal } from "./CopyYearModal";
import { AddSupplierModal } from "./AddSupplierModal";
import { BulkUploadModal } from "./BulkUploadModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ColumnDef {
  key: string;
  label: string;
  tooltip: string;
  legend?: { icon: React.ReactNode; label: string }[];
}

const columns: ColumnDef[] = [
  { key: "name", label: "Name", tooltip: "Legal entity name of the supplier in your procurement system." },
  { key: "hq", label: "Company HQ", tooltip: "Country where the supplier's headquarters is located." },
  { key: "tco2e", label: "tCO2e", tooltip: "Total metric tonnes of CO2 equivalent emissions attributed to this supplier." },
  { key: "spend", label: "Spend on Supplier", tooltip: "Total annual procurement spend with this supplier in USD." },
  { key: "targets", label: "Targets", tooltip: "Whether the supplier has set science-based or net-zero emission reduction targets." },
  { key: "sbtAligned", label: "SBT Aligned?", tooltip: "Shows whether the supplier's targets are SBTi aligned." },
  
  { key: "category", label: "Category", tooltip: "GHG Protocol Scope 3 category classification for this supplier's emissions." },
  { key: "calcMethod", label: "Calc. Methodology", tooltip: "Whether emissions are calculated from spend data or directly from CO₂e data provided by the supplier." },
  { key: "spendFactorType", label: "Spend Factor Type", tooltip: "Whether the emission factor used is AI-generated or a custom value entered by the user. Only applicable to spend-based calculations." },
  { key: "influence", label: "Influence", tooltip: "Your estimated level of influence over this supplier's sustainability practices, rated 1–5." },
  { key: "synced", label: "Status", tooltip: "Whether the supplier was successfully found in 51-0's supplier database." },
];

// Legends are built after targetStatusConfig is defined, so we use a function
const getColumnLegends = (): Record<string, { icon: React.ReactNode; label: string }[]> => ({
  targets: [
    { icon: <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-px rounded-full border bg-target-sbti-validated-bg text-target-sbti-validated-text border-target-sbti-validated-border"><ShieldCheck size={8} /> SBTi</span>, label: "Validated" },
    { icon: <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-px rounded-full border bg-target-sbti-committed-bg text-target-sbti-committed-text border-target-sbti-committed-border"><Clock size={8} /> SBTi</span>, label: "Committed" },
    { icon: <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-px rounded-full border bg-target-sbti-inherited-bg text-target-sbti-inherited-text border-target-sbti-inherited-border"><ArrowUpRight size={8} /></span>, label: "SBTi Inherited" },
    { icon: <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-px rounded-full border bg-target-self-published-bg text-target-self-published-text border-target-self-published-border"><FileText size={8} /></span>, label: "Self Published" },
    { icon: <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-px rounded-full border bg-target-no-targets-bg text-target-no-targets-text border-target-no-targets-border"><Minus size={8} /></span>, label: "No Targets" },
  ],
  sbtAligned: [
    { icon: <CheckCircle2 size={12} className="text-confidence-high-text" />, label: "SBTi Aligned" },
    { icon: <XCircle size={12} className="text-destructive/60" />, label: "Not Aligned" },
    { icon: <AlertTriangle size={12} className="text-amber-500" />, label: "Verify (Self Published)" },
  ],
  synced: [
    { icon: <CheckCircle2 size={12} className="text-confidence-high-text" />, label: "Successfully found" },
    { icon: <AlertTriangle size={12} className="text-amber-500" />, label: "Action Required" },
    { icon: <span className="inline-block w-3 h-0.5 bg-muted-foreground/40 rounded" />, label: "Not connected" },
  ],
  calcMethod: [
    { icon: <span className="inline-flex text-[9px] font-medium px-1 py-px rounded-full bg-secondary text-foreground">Spend</span>, label: "Spend Data Input" },
    { icon: <span className="inline-flex text-[9px] font-medium px-1 py-px rounded-full bg-accent/10 text-accent">CO₂e</span>, label: "CO₂e Data Input" },
  ],
  spendFactorType: [
    { icon: <span className="inline-flex text-[9px] font-medium px-1 py-px rounded-full bg-secondary text-foreground">AI</span>, label: "AI Generated" },
    { icon: <span className="inline-flex text-[9px] font-medium px-1 py-px rounded-full bg-amber-500/10 text-amber-600">Custom</span>, label: "User Input" },
  ],
});

const HeaderCell = ({ column }: { column: ColumnDef }) => {
  const legends = getColumnLegends();
  const legend = legends[column.key];
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-table-header">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            {column.label}
            <Info size={12} className="opacity-40 hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
          <p>{column.tooltip}</p>
          {legend && (
            <div className="mt-2 pt-2 border-t border-border/50 flex flex-col gap-1.5">
              {legend.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </th>
  );
};

const CountryFlag = ({ countryCode }: { countryCode: string }) => (
  <img
    src={getFlagUrl(countryCode)}
    alt={countryCode}
    width={20}
    height={15}
    className="inline-block rounded-[2px]"
    loading="lazy"
  />
);

const targetStatusConfig: Record<TargetStatus, { pillText: string; tooltip: string; icon: React.ReactNode; colorClass: string }> = {
  "sbti-validated": { pillText: "SBTi Validated", tooltip: "Supplier has SBTi Validated Targets", icon: <ShieldCheck size={10} />, colorClass: "bg-target-sbti-validated-bg text-target-sbti-validated-text border-target-sbti-validated-border" },
  "sbti-committed": { pillText: "SBTi Committed", tooltip: "Supplier has committed to set SBTi Targets", icon: <Clock size={10} />, colorClass: "bg-target-sbti-committed-bg text-target-sbti-committed-text border-target-sbti-committed-border" },
  "sbti-inherited": { pillText: "SBTi Inherited", tooltip: "Targets inherited from parent company", icon: <ArrowUpRight size={10} />, colorClass: "bg-target-sbti-inherited-bg text-target-sbti-inherited-text border-target-sbti-inherited-border" },
  "self-published": { pillText: "Self Published", tooltip: "Supplier has self-published targets", icon: <FileText size={10} />, colorClass: "bg-target-self-published-bg text-target-self-published-text border-target-self-published-border" },
  "no-targets": { pillText: "No Targets", tooltip: "No public targets found", icon: <Minus size={10} />, colorClass: "bg-target-no-targets-bg text-target-no-targets-text border-target-no-targets-border" },
};

const SbtiStatusBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-target-sbti-validated-bg text-target-sbti-validated-text border border-target-sbti-validated-border">
    {label}
  </span>
);

const TargetStatusCell = ({ status, inheritedFrom }: { status: TargetStatus; inheritedFrom?: string }) => {
  const config = targetStatusConfig[status] || targetStatusConfig["no-targets"];
  const tooltip = status === "sbti-inherited" && inheritedFrom
    ? `Targets inherited from parent company: ${inheritedFrom}`
    : config.tooltip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border cursor-default ${config.colorClass}`}>
          {config.icon}
          {config.pillText}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={status === "sbti-validated" || status === "self-published" || status === "sbti-committed" ? "text-xs p-3" : "text-xs"}>
        {status === "sbti-validated" ? (
          <div className="space-y-2">
            <p className="text-popover-foreground">Supplier has SBTi Validated Targets</p>
            <div className="border-t border-border pt-2">
              <p className="font-semibold text-popover-foreground mb-1.5">SBTi Status</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Near Term</span>
                  <SbtiStatusBadge label="Targets Set" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Long Term</span>
                  <SbtiStatusBadge label="Targets Set" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Net Zero</span>
                  <SbtiStatusBadge label="Targets set" />
                </div>
              </div>
            </div>
          </div>
        ) : status === "self-published" ? (
          <div className="space-y-2">
            <p className="text-popover-foreground">Supplier has self-published targets</p>
            <div className="border-t border-border pt-2">
              <p className="font-semibold text-popover-foreground mb-1.5">Document-based Targets</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Near Term</span>
                  <SbtiStatusBadge label="Targets Set" />
                  <a href="https://www.51tocarbonzero.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Net Zero</span>
                  <SbtiStatusBadge label="Targets Set" />
                  <a href="https://www.51tocarbonzero.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : status === "sbti-committed" ? (
          <div className="space-y-2">
            <p className="text-popover-foreground">Supplier has committed to set SBTi Targets</p>
            <div className="border-t border-border pt-2">
              <p className="font-semibold text-popover-foreground mb-1.5">SBTi Status</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Near Term</span>
                  <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Committed</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Net Zero</span>
                  <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Committed</span>
                </div>
              </div>
            </div>
          </div>
        ) : tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
export const SupplierTable = () => {
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [yearData, setYearData] = useState<YearData[]>(initialYearData);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [copyModalData, setCopyModalData] = useState<{ suppliers: Supplier[]; fromYear: number } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set(["calcMethod", "spendFactorType", "influence"]));
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHQ, setFilterHQ] = useState("");
  const [filterTargets, setFilterTargets] = useState("");
  
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSynced, setFilterSynced] = useState("");
  const [filterCalcMethod, setFilterCalcMethod] = useState("");
  const [filterSpendFactor, setFilterSpendFactor] = useState("");
  const [filterSbtAligned, setFilterSbtAligned] = useState("");
  const [filterInfluence, setFilterInfluence] = useState("");

  // Columns that can be toggled (exclude "name" as it's always visible)
  const toggleableColumns = columns.filter((c) => c.key !== "name");
  const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.key));

  const toggleColumn = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const currentData = yearData.find((y) => y.year === selectedYear);
  const allSuppliers = currentData?.suppliers ?? [];

  // Apply filters
  const suppliers = allSuppliers.filter((s) => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterHQ && s.hqCountry !== filterHQ) return false;
    if (filterTargets === "empty" && s.targetStatus) return false;
    if (filterTargets && filterTargets !== "empty" && s.targetStatus !== filterTargets) return false;
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterSynced === "yes" && s.synced !== "synced") return false;
    if (filterSynced === "no" && s.synced === "synced") return false;
    if (filterCalcMethod && s.calculationMethodology !== filterCalcMethod) return false;
    if (filterSpendFactor === "ai" && s.methodology === "Input by User") return false;
    if (filterSpendFactor === "ai" && s.calculationMethodology === "tco2e") return false;
    if (filterSpendFactor === "custom" && s.methodology !== "Input by User") return false;
    if (filterSbtAligned === "yes" && s.sbtAligned !== true) return false;
    if (filterSbtAligned === "no" && s.sbtAligned !== false) return false;
    if (filterSbtAligned === "unknown" && s.sbtAligned !== undefined) return false;
    if (filterInfluence && s.influence !== Number(filterInfluence)) return false;
    return true;
  });

  const hasActiveFilters = searchQuery || filterHQ || filterTargets || filterCategory || filterSynced || filterCalcMethod || filterSpendFactor || filterSbtAligned || filterInfluence;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterHQ("");
    setFilterTargets("");
    
    setFilterCategory("");
    setFilterSynced("");
    setFilterCalcMethod("");
    setFilterSpendFactor("");
    setFilterSbtAligned("");
    setFilterInfluence("");
  };

  // Unique values for filter dropdowns
  const uniqueCountries = [...new Set(allSuppliers.map((s) => s.hqCountry))].sort();
  const uniqueCategories = [...new Set(allSuppliers.map((s) => s.category))].sort();
  const years = yearData.map((y) => y.year).sort((a, b) => b - a);

  const handleAddNewYear = () => {
    const maxYear = Math.max(...years);
    const newYear = maxYear + 1;
    setYearData((prev) => [...prev, { year: newYear, suppliers: [] }]);
    setSelectedYear(newYear);
    toast.success(`Year ${newYear} created`);
  };

  const handleCopyLastYear = () => {
    const currentYearData = yearData.find((y) => y.year === selectedYear);
    if (!currentYearData || currentYearData.suppliers.length > 0) {
      toast.error("Can only copy into an empty year");
      return;
    }

    const sortedYears = years.filter((y) => y < selectedYear).sort((a, b) => b - a);
    if (sortedYears.length === 0) {
      toast.error("No previous year to copy from");
      return;
    }

    const prevYear = sortedYears[0];
    const prevData = yearData.find((y) => y.year === prevYear);
    if (!prevData || prevData.suppliers.length === 0) return;

    setCopyModalData({ suppliers: prevData.suppliers, fromYear: prevYear });
  };

  const handleCopyConfirm = (selected: Supplier[]) => {
    const copiedSuppliers = selected.map((s) => ({ ...s, tco2e: 0, spend: 0 }));
    setYearData((prev) =>
      prev.map((y) =>
        y.year === selectedYear ? { ...y, suppliers: copiedSuppliers } : y
      )
    );
    toast.success(`Copied ${copiedSuppliers.length} suppliers (spend & tCO2e reset)`);
    setCopyModalData(null);
  };

  const handleSaveSupplier = (updated: Supplier) => {
    setYearData((prev) =>
      prev.map((y) =>
        y.year === selectedYear
          ? { ...y, suppliers: y.suppliers.map((s) => (s.id === updated.id ? updated : s)) }
          : y
      )
    );
    toast.success("Supplier updated");
  };

  const handleResyncSupplier = (updated: Supplier) => {
    // Save the updated supplier info first
    handleSaveSupplier(updated);
    // Trigger re-sync simulation
    setSyncingIds((prev) => new Set(prev).add(updated.id));
    setTimeout(() => {
      const ef = +(0.05 + Math.random() * 0.8).toFixed(3);
      const tco2e = +(updated.spend * ef).toFixed(2);
      setYearData((prev) =>
        prev.map((y) =>
          y.year === selectedYear
            ? {
                ...y,
                suppliers: y.suppliers.map((s) =>
                  s.id === updated.id
                    ? { ...s, synced: "synced" as const, emissionFactor: ef, tco2e }
                    : s
                ),
              }
            : y
        )
      );
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });
      toast.success(`${updated.name} re-synced`);
    }, 5000);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setYearData((prev) =>
      prev.map((y) =>
        y.year === selectedYear
          ? { ...y, suppliers: y.suppliers.filter((s) => s.id !== supplierId) }
          : y
      )
    );
    toast.success("Supplier deleted");
  };

  const handleAddSupplier = (newSupplier: Supplier) => {
    // Add supplier with synced = false
    setYearData((prev) =>
      prev.map((y) =>
        y.year === selectedYear ? { ...y, suppliers: [...y.suppliers, newSupplier] } : y
      )
    );
    toast.success(`${newSupplier.name} added`);

    // Simulate syncing for 5 seconds
    setSyncingIds((prev) => new Set(prev).add(newSupplier.id));
    setTimeout(() => {
      const ef = +(0.05 + Math.random() * 0.8).toFixed(3);
      const tco2e = +(newSupplier.spend * ef).toFixed(2);
      setYearData((prev) =>
        prev.map((y) =>
          y.year === selectedYear
            ? {
                ...y,
                suppliers: y.suppliers.map((s) =>
                  s.id === newSupplier.id
                    ? { ...s, synced: "synced" as const, emissionFactor: ef, tco2e }
                    : s
                ),
              }
            : y
        )
      );
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(newSupplier.id);
        return next;
      });
      toast.success(`${newSupplier.name} synced`);
    }, 5000);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent w-[160px]"
            />
          </div>

          <select value={filterHQ} onChange={(e) => setFilterHQ(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Company HQ</option>
            {uniqueCountries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterTargets} onChange={(e) => setFilterTargets(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Targets</option>
            <option value="sbti-validated">SBTi Validated</option>
            <option value="sbti-committed">SBTi Committed</option>
            <option value="sbti-inherited">SBTi Inherited</option>
            <option value="self-published">Self Published</option>
            <option value="no-targets">No Targets</option>
          </select>


          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Category</option>
            {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterSynced} onChange={(e) => setFilterSynced(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Status</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <select value={filterCalcMethod} onChange={(e) => setFilterCalcMethod(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Calc. Methodology</option>
            <option value="spend">Spend Data Input</option>
            <option value="tco2e">CO₂e Data Input</option>
          </select>

          <select value={filterSpendFactor} onChange={(e) => setFilterSpendFactor(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Spend Factor Type</option>
            <option value="ai">AI Generated</option>
            <option value="custom">Custom</option>
          </select>

          <select value={filterSbtAligned} onChange={(e) => setFilterSbtAligned(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">SBT Aligned?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>

          <select value={filterInfluence} onChange={(e) => setFilterInfluence(e.target.value)} className="h-8 px-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="">Influence</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors duration-150"
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors duration-150">
                <Settings size={15} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[280px] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Fields</p>
              <div className="grid grid-cols-2 gap-2">
                {toggleableColumns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox
                      checked={!hiddenColumns.has(col.key)}
                      onCheckedChange={() => toggleColumn(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="inline-flex rounded-lg overflow-hidden">
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 transition-colors duration-150"
            >
              <Plus size={14} />
              ADD
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center px-2 py-1.5 text-accent-foreground bg-accent hover:bg-accent/90 border-l border-accent-foreground/20 transition-colors duration-150">
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setBulkUploadOpen(true)}>
                  <Upload size={14} className="mr-2" />
                  Bulk Upload
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {suppliers.length === 0 && (
            <button
              onClick={handleCopyLastYear}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors duration-150"
            >
              <Copy size={14} />
              Copy last year's suppliers
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors duration-150"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,.05),0_2px_4px_rgba(0,0,0,.02)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {visibleColumns.map((col) => (
                  <HeaderCell key={col.key} column={col} />
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-12 text-center text-muted-foreground">
                    No suppliers for {selectedYear}. Copy from a previous year to get started.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr
                    key={s.id}
                    title={s.synced === "warning" ? "Action Required — Please edit supplier to add more detail" : undefined}
                    className={`border-b border-border last:border-b-0 transition-colors duration-75 ${s.synced === "error" ? "bg-destructive/5 hover:bg-destructive/10" : s.synced === "warning" ? "bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer" : "hover:bg-table-hover"}`}
                  >
                    {!hiddenColumns.has("name") && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(s)}
                          className="text-muted-foreground hover:text-accent transition-colors duration-150 shrink-0"
                          title="Edit supplier"
                        >
                          <Pencil size={13} />
                        </button>
                        {s.synced === "warning" ? (
                          <span className="font-medium text-foreground text-left">{s.name}</span>
                        ) : (
                          <button
                            onClick={() => setSelected(s)}
                            className="font-medium text-foreground underline-offset-4 hover:underline hover:text-accent transition-colors duration-150 text-left"
                          >
                            {s.name}
                          </button>
                        )}
                      </div>
                    </td>
                    )}
                    {!hiddenColumns.has("hq") && (
                    <td className="px-4 py-3">
                      <CountryFlag countryCode={s.hqCountry} />
                    </td>
                    )}
                    {!hiddenColumns.has("tco2e") && (
                    <td className="px-4 py-3 font-mono-tabular">
                      {(s.synced === "not-synced" || s.synced === "warning" || s.synced === "error") && s.calculationMethodology === "spend" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-default">
                              <AlertTriangle size={16} className="text-amber-500" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                            No Emission Factor available as AI was not able to synch the company.
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        s.tco2e.toFixed(2)
                      )}
                    </td>
                    )}
                    {!hiddenColumns.has("spend") && (
                    <td className="px-4 py-3 font-mono-tabular">{s.spend.toLocaleString()}</td>
                    )}
                    {!hiddenColumns.has("targets") && (
                    <td className="px-4 py-3">
                      {(s.synced === "not-synced" || s.synced === "warning" || s.synced === "error") ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <TargetStatusCell status={s.targetStatus} inheritedFrom={s.inheritedFrom} />
                      )}
                    </td>
                    )}
                    {!hiddenColumns.has("sbtAligned") && (
                    <td className="px-4 py-3">
                      {(s.synced === "not-synced" || s.synced === "warning" || s.synced === "error") ? (
                        <span className="text-muted-foreground">-</span>
                      ) : s.targetStatus === "self-published" && !s.sbtAligned ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-default">
                              <AlertTriangle size={16} className="text-amber-500" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                            Self-published targets — please verify SBTi alignment
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              {s.sbtAligned ? (
                                <CheckCircle2 size={16} className="text-confidence-high-text" />
                              ) : (
                                <XCircle size={16} className="text-destructive/60" />
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {s.sbtAligned ? "SBTi Aligned" : "Not SBTi Aligned"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    )}
                    {!hiddenColumns.has("category") && (
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{s.category}</td>
                    )}
                    {!hiddenColumns.has("calcMethod") && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.calculationMethodology === "spend"
                          ? "bg-secondary text-foreground"
                          : "bg-accent/10 text-accent"
                      }`}>
                        {s.calculationMethodology === "spend" ? "Spend Data Input" : "CO₂e Data Input"}
                      </span>
                    </td>
                    )}
                    {!hiddenColumns.has("spendFactorType") && (
                    <td className="px-4 py-3">
                      {s.calculationMethodology === "tco2e" ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          s.methodology === "Input by User"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-secondary text-foreground"
                        }`}>
                          {s.methodology === "Input by User" ? "Custom" : "AI Generated"}
                        </span>
                      )}
                    </td>
                    )}
                    {!hiddenColumns.has("influence") && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              s.influence && n <= s.influence
                                ? "bg-accent"
                                : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    )}
                    {!hiddenColumns.has("synced") && (
                    <td className="px-4 py-3">
                      {syncingIds.has(s.id) ? (
                        <Loader2 size={16} className="text-muted-foreground animate-spin" />
                      ) : s.synced === "not-synced" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex cursor-default text-muted-foreground">—</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              Not connected to 51-0's Supplier Database.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`inline-flex cursor-default`}>
                                {s.synced === "synced" && <CheckCircle2 size={16} className="text-confidence-high-text" />}
                                {s.synced === "error" && <AlertTriangle size={16} className="text-destructive" />}
                                {s.synced === "warning" && <AlertTriangle size={16} className="text-amber-500" />}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                              {s.synced === "synced" && "Successfully found Supplier Data."}
                              {s.synced === "error" && "Error — Please Try Again."}
                              {s.synced === "warning" && "Action Required. Please edit supplier to add more detail."}
                            </TooltipContent>
                          </Tooltip>
                        )}
                    </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <SupplierModal supplier={selected} onClose={() => setSelected(null)} />
        <SupplierEditModal supplier={editing} onClose={() => setEditing(null)} onSave={handleSaveSupplier} onDelete={handleDeleteSupplier} onResync={handleResyncSupplier} year={selectedYear} />
        <AddSupplierModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddSupplier} year={selectedYear} />
        <BulkUploadModal open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} />
        {copyModalData && (
          <CopyYearModal
            suppliers={copyModalData.suppliers}
            fromYear={copyModalData.fromYear}
            toYear={selectedYear}
            onClose={() => setCopyModalData(null)}
            onConfirm={handleCopyConfirm}
          />
        )}
      </>
    </TooltipProvider>
  );
};
