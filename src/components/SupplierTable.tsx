import { useState } from "react";
import { Info, CheckCircle2, XCircle, Plus, Copy, ChevronDown, Pencil, Loader2 } from "lucide-react";
import { type Supplier, type YearData, initialYearData, getFlagUrl } from "@/data/suppliers";
import { SupplierModal } from "./SupplierModal";
import { SupplierEditModal } from "./SupplierEditModal";
import { CopyYearModal } from "./CopyYearModal";
import { AddSupplierModal } from "./AddSupplierModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
}

const columns: ColumnDef[] = [
  { key: "name", label: "Name", tooltip: "Legal entity name of the supplier in your procurement system." },
  { key: "tco2e", label: "tCO2e", tooltip: "Total metric tonnes of CO2 equivalent emissions attributed to this supplier." },
  { key: "spend", label: "Spend on Supplier", tooltip: "Total annual procurement spend with this supplier in USD." },
  { key: "targets", label: "Targets", tooltip: "Whether the supplier has set science-based or net-zero emission reduction targets." },
  { key: "cdp", label: "CDP", tooltip: "Whether the supplier discloses environmental data through the CDP (formerly Carbon Disclosure Project)." },
  { key: "category", label: "Category", tooltip: "GHG Protocol Scope 3 category classification for this supplier's emissions." },
  { key: "synced", label: "Synced", tooltip: "Whether emission data is synced with the supplier's latest disclosure." },
];

const HeaderCell = ({ column }: { column: ColumnDef }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-table-header">
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-help">
          {column.label}
          <Info size={12} className="opacity-40 hover:opacity-100 transition-opacity" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs leading-relaxed">
        {column.tooltip}
      </TooltipContent>
    </Tooltip>
  </th>
);

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

export const SupplierTable = () => {
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [yearData, setYearData] = useState<YearData[]>(initialYearData);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [copyModalData, setCopyModalData] = useState<{ suppliers: Supplier[]; fromYear: number } | null>(null);

  const currentData = yearData.find((y) => y.year === selectedYear);
  const suppliers = currentData?.suppliers ?? [];
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

  return (
    <TooltipProvider>
      <>
        <div className="flex items-center gap-3 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors duration-150">
              {selectedYear}
              <ChevronDown size={14} className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {years.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? "bg-secondary" : ""}
                >
                  {year}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAddNewYear}>
                <Plus size={14} className="mr-2" />
                Add new year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {suppliers.length === 0 && (
            <button
              onClick={handleCopyLastYear}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors duration-150"
            >
              <Copy size={14} />
              Copy last year's suppliers
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,.05),0_2px_4px_rgba(0,0,0,.02)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <HeaderCell key={col.key} column={col} />
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    No suppliers for {selectedYear}. Copy from a previous year to get started.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-b-0 hover:bg-table-hover transition-colors duration-75"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(s)}
                          className="text-muted-foreground hover:text-accent transition-colors duration-150 shrink-0"
                          title="Edit supplier"
                        >
                          <Pencil size={13} />
                        </button>
                        <CountryFlag countryCode={s.hqCountry} />
                        <button
                          onClick={() => setSelected(s)}
                          className="font-medium text-foreground underline-offset-4 hover:underline hover:text-accent transition-colors duration-150 text-left"
                        >
                          {s.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-tabular">{s.tco2e.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono-tabular">{s.spend.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {s.hasTargets ? (
                        <CheckCircle2 size={16} className="text-confidence-high-text" />
                      ) : (
                        <XCircle size={16} className="text-destructive/60" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.cdp ? (
                        <CheckCircle2 size={16} className="text-confidence-high-text" />
                      ) : (
                        <XCircle size={16} className="text-destructive/60" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{s.category}</td>
                    <td className="px-4 py-3">
                      <span className={s.synced ? "text-confidence-high-text" : "text-destructive"}>
                        {s.synced ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <SupplierModal supplier={selected} onClose={() => setSelected(null)} />
        <SupplierEditModal supplier={editing} onClose={() => setEditing(null)} onSave={handleSaveSupplier} />
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
