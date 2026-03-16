import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Cloud, Info, Sparkles, PenLine } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupplierEditModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (updated: Supplier) => void;
  year?: number;
}

const categories = [
  "Purchased goods & services",
  "Capital goods",
  "Fuel & energy related activities",
  "Upstream transportation & distribution",
  "Waste generated in operations",
  "Business travel",
  "Employee commuting",
  "Upstream leased assets",
];

const industries = [
  "Enterprise Software",
  "Route Optimization",
  "Advertising Analytics",
  "Financial Data & Analytics",
  "Staffing & Recruitment",
  "Creative Services",
  "Data Center Infrastructure",
  "Cloud Data Platform",
  "Sales Enablement",
  "Compensation Consulting",
  "Supply Chain Emissions",
  "CRM & Cloud Computing",
  "Cloud Consulting",
  "Audit & Advisory",
  "IT Infrastructure",
];

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "IE", name: "Ireland" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "IL", name: "Israel" },
];

export const SupplierEditModal = ({ supplier, onClose, onSave }: SupplierEditModalProps) => {
  const [draft, setDraft] = useState<Supplier | null>(null);

  useEffect(() => {
    setDraft(supplier ? { ...supplier } : null);
  }, [supplier]);

  if (!draft) return null;

  const update = <K extends keyof Supplier>(key: K, value: Supplier[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = () => {
    if (draft) {
      const updated = draft.calculationMethodology === "tco2e"
        ? { ...draft }
        : { ...draft, tco2e: +(draft.spend * draft.emissionFactor).toFixed(2) };
      onSave(updated);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {supplier && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg bg-card rounded-xl p-6 shadow-[0_0_0_1px_rgba(0,0,0,.08),0_20px_25px_-5px_rgba(0,0,0,.1),0_10px_10px_-5px_rgba(0,0,0,.04)] z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-semibold text-foreground mb-4">Edit Supplier</h2>

            <Tabs defaultValue="year-data">
              <TabsList className="w-full">
                <TabsTrigger value="year-data" className="flex-1">Year Data</TabsTrigger>
                <TabsTrigger value="supplier-data" className="flex-1">Supplier Data</TabsTrigger>
              </TabsList>

              <TabsContent value="year-data" className="pt-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* CO2e Calculation Section */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">CO₂e Calculation</p>

                  {draft.calculationMethodology === "tco2e" ? (
                    /* Direct tCO2e entry mode */
                    <div className="space-y-4">
                      <div>
                        <Label>
                          tCO₂e
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={draft.tco2e}
                          onChange={(e) => update("tco2e", Number(e.target.value))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="spend">Spend on Supplier</Label>
                        <Input
                          id="spend"
                          type="number"
                          value={draft.spend}
                          onChange={(e) => update("spend", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Spend-based calculation mode */
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="spend">
                          Year Spend on Supplier
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="spend"
                          type="number"
                          value={draft.spend}
                          onChange={(e) => update("spend", Number(e.target.value))}
                          className="mt-1"
                          required
                        />
                      </div>

                      {/* Factor source selection */}
                      <div>
                        <Label className="mb-2 block">Spend Emission Factor Source</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (draft.methodology === "Input by User") {
                                update("methodology", "Industry benchmark");
                              }
                            }}
                            className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                              draft.methodology !== "Input by User"
                                ? "border-accent bg-accent/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles size={16} className={draft.methodology !== "Input by User" ? "text-accent" : "text-muted-foreground"} />
                              <span className="text-sm font-medium text-foreground">AI Generated Factor</span>
                            </div>
                            <span className="text-xs text-muted-foreground leading-snug">
                              Use an AI generated emission factor.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => update("methodology", "Input by User")}
                            className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                              draft.methodology === "Input by User"
                                ? "border-accent bg-accent/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <PenLine size={16} className={draft.methodology === "Input by User" ? "text-accent" : "text-muted-foreground"} />
                              <span className="text-sm font-medium text-foreground">Use Your Own Factor</span>
                            </div>
                            <span className="text-xs text-muted-foreground leading-snug">
                              Enter a custom emission factor manually.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Conditional fields based on factor source */}
                      {draft.methodology !== "Input by User" ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Emission Factor (per £)</Label>
                            <Input
                              value={draft.emissionFactor}
                              disabled
                              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <Label>Emission Factor Methodology</Label>
                            <Input
                              value={draft.methodology}
                              disabled
                              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="emissionFactor">
                              Emission Factor (per £)
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              id="emissionFactor"
                              type="number"
                              step="0.001"
                              value={draft.emissionFactor}
                              onChange={(e) => update("emissionFactor", Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Emission Factor Methodology</Label>
                            <Input
                              value="Input by User"
                              disabled
                              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                        </div>
                      )}

                      {/* tCO2e calculated */}
                      <div>
                        <Label>tCO₂e (calculated)</Label>
                        <Input
                          value={+(draft.spend * draft.emissionFactor).toFixed(2)}
                          disabled
                          className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reporting & Targets Section */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reporting & Targets</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <Label>Targets</Label>
                      <Select
                        value={draft.hasTargets ? "yes" : "no"}
                        onValueChange={(v) => update("hasTargets", v === "yes")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>CDP</Label>
                      <Select
                        value={draft.cdp ? "yes" : "no"}
                        onValueChange={(v) => update("cdp", v === "yes")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="supplier-data" className="pt-4">
                {/* Supplier Info */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Supplier Info</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={draft.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Company HQ</Label>
                      <Input
                        value={countries.find((c) => c.code === draft.hqCountry)?.name || draft.hqCountry}
                        disabled
                        className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <Label>Category</Label>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={13} className="text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[220px] text-xs">
                              Which business category does this supplier belong to? If unsure, select Purchased Goods & Services.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={draft.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Industry</Label>
                      <Input
                        value={draft.industry}
                        disabled
                        className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-website">Website</Label>
                      <Input
                        id="edit-website"
                        value={draft.website}
                        disabled
                        className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={draft.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Data */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calculation Data</p>

                  <Label className="mb-2 block">How do you want to calculate emissions?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => update("calculationMethodology", "spend")}
                      className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                        draft.calculationMethodology === "spend"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className={draft.calculationMethodology === "spend" ? "text-accent" : "text-muted-foreground"} />
                        <span className="text-sm font-medium text-foreground">I have spend data</span>
                      </div>
                      <span className="text-xs text-muted-foreground leading-snug">
                        We'll estimate emissions using your annual spend with this supplier.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => update("calculationMethodology", "tco2e")}
                      className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                        draft.calculationMethodology === "tco2e"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Cloud size={16} className={draft.calculationMethodology === "tco2e" ? "text-accent" : "text-muted-foreground"} />
                        <span className="text-sm font-medium text-foreground">I have CO₂e data</span>
                      </div>
                      <span className="text-xs text-muted-foreground leading-snug">
                        Enter emissions provided by the supplier directly.
                      </span>
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-150"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
