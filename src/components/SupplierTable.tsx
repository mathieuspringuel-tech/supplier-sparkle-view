import { useState } from "react";
import { Info, CheckCircle2, XCircle } from "lucide-react";
import { suppliers, type Supplier } from "@/data/suppliers";
import { SupplierModal } from "./SupplierModal";

interface ColumnDef {
  key: string;
  label: string;
  tooltip: string;
}

const columns: ColumnDef[] = [
  { key: "name", label: "Name", tooltip: "Legal entity name of the supplier in your procurement system." },
  
  { key: "tco2e", label: "tCO2e", tooltip: "Total metric tonnes of CO2 equivalent emissions attributed to this supplier." },
  { key: "spend", label: "Spend on Supplier", tooltip: "Total annual procurement spend with this supplier in USD." },
  { key: "score", label: "Score", tooltip: "Composite ESG score (0–100%) based on disclosed climate data quality." },
  { key: "targets", label: "Targets", tooltip: "Whether the supplier has set science-based or net-zero emission reduction targets." },
  { key: "cdp", label: "CDP", tooltip: "Whether the supplier discloses environmental data through the CDP (formerly Carbon Disclosure Project)." },
  { key: "category", label: "Category", tooltip: "GHG Protocol Scope 3 category classification for this supplier's emissions." },
  { key: "synced", label: "Synced", tooltip: "Whether emission data is synced with the supplier's latest disclosure." },
  
];

const HeaderCell = ({ column }: { column: ColumnDef }) => (
  <th className="group relative px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-table-header">
    <div className="flex items-center gap-1.5 cursor-help">
      {column.label}
      <Info size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block w-52 p-2.5 bg-foreground text-primary-foreground text-[11px] leading-relaxed rounded-md shadow-xl z-50 normal-case tracking-normal">
      {column.tooltip}
      <div className="absolute top-full left-4 border-[6px] border-transparent border-t-foreground" />
    </div>
  </th>
);

export const SupplierTable = () => {
  const [selected, setSelected] = useState<Supplier | null>(null);

  return (
    <>
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
            {suppliers.map((s) => (
              <tr
                key={s.id}
                className="border-b border-border last:border-b-0 hover:bg-table-hover transition-colors duration-75"
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(s)}
                    className="font-medium text-foreground underline-offset-4 hover:underline hover:text-accent transition-colors duration-150 text-left"
                  >
                    {s.name}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5" title={s.hqCountry}>
                    <span className="text-base leading-none">{s.hqFlag}</span>
                    <span className="text-muted-foreground text-xs">{s.hqCountry}</span>
                  </span>
                </td>
                <td className="px-4 py-3 font-mono-tabular">{s.tco2e.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono-tabular">{s.spend.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono-tabular">{s.score}%</td>
                <td className="px-4 py-3">
                  {s.hasTargets ? (
                    <CheckCircle2 size={16} className="text-confidence-high-text" />
                  ) : (
                    <XCircle size={16} className="text-destructive/60" />
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.cdp ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{s.category}</td>
                <td className="px-4 py-3">
                  <span className={s.synced ? "text-confidence-high-text" : "text-destructive"}>
                    {s.synced ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors duration-150"
                    title={s.website}
                  >
                    <Globe size={15} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupplierModal supplier={selected} onClose={() => setSelected(null)} />
    </>
  );
};
