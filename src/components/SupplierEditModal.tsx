import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Cloud, Info, Sparkles, PenLine, Trash2 } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { deriveSbtAligned } from "@/data/suppliers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  onDelete?: (supplierId: string) => void;
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

export const SupplierEditModal = ({ supplier, onClose, onSave, onDelete, year }: SupplierEditModalProps) => {
  const [draft, setDraft] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState("year-data");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [overrideConfirm, setOverrideConfirm] = useState<{
    field: "Targets";
    applyChange: () => void;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const originalRef = useRef<Supplier | null>(null);

  useEffect(() => {
    setDraft(supplier ? { ...supplier } : null);
    originalRef.current = supplier ? { ...supplier } : null;
    setActiveTab("year-data");
    setValidationError(null);
  }, [supplier]);

  if (!draft) return null;

  const isSynced = draft.synced === "synced";

  const update = <K extends keyof Supplier>(key: K, value: Supplier[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setValidationError(null);
  };

  const handleTargetChange = (value: string) => {
    const applyTargetAndAlign = () => {
      const ts = value as any;
      const aligned = deriveSbtAligned(ts);
      setDraft((prev) => prev ? { ...prev, targetStatus: ts, sbtAligned: aligned.locked ? aligned.value : prev.sbtAligned } : prev);
    };
    if (isSynced && originalRef.current && value !== originalRef.current.targetStatus) {
      setOverrideConfirm({ field: "Targets", applyChange: applyTargetAndAlign });
    } else {
      applyTargetAndAlign();
    }
  };


  const handleSave = () => {
    if (!draft) return;

    if (draft.calculationMethodology === "tco2e" && (!draft.tco2e || draft.tco2e <= 0)) {
      setActiveTab("year-data");
      setValidationError("tco2e");
      return;
    }

    if (draft.calculationMethodology === "spend" && (!draft.spend || draft.spend <= 0)) {
      setActiveTab("year-data");
      setValidationError("spend");
      return;
    }

    const updated = draft.calculationMethodology === "tco2e"
      ? { ...draft }
      : { ...draft, tco2e: +(draft.spend * draft.emissionFactor).toFixed(2) };
    onSave(updated);
    onClose();
  };

  return (
    <>
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

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setValidationError(null); }}>
              <TabsList className="w-full">
                <TabsTrigger value="year-data" className="flex-1">{year || "Year"} Data</TabsTrigger>
                <TabsTrigger value="supplier-data" className="flex-1">Supplier Data</TabsTrigger>
              </TabsList>

              <TabsContent value="year-data" className="pt-3">
                {/* Calculation Data - Method Selection */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calculation Data</p>

                  <Label className="mb-2 block">How do you want to calculate emissions?</Label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
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
                      onClick={() => {
                        setDraft((prev) => prev ? { ...prev, calculationMethodology: "tco2e" as const, tco2e: 0 } : prev);
                        setValidationError(null);
                      }}
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

                {/* CO2e Calculation Section */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CO₂e Calculation</p>

                  {draft.calculationMethodology === "tco2e" ? (
                    /* Direct tCO2e entry mode */
                    <div className="space-y-3">
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
                          className={`mt-1 ${validationError === "tco2e" ? "border-destructive ring-1 ring-destructive" : ""}`}
                          required
                        />
                        {validationError === "tco2e" && (
                          <p className="text-xs text-destructive mt-1">tCO₂e is required.</p>
                        )}
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
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="spend">
                          {year || "Year"} Spend on Supplier
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="spend"
                            type="number"
                            value={draft.spend}
                            onChange={(e) => update("spend", Number(e.target.value))}
                            className={`mt-1 pr-14 ${validationError === "spend" ? "border-destructive ring-1 ring-destructive" : ""}`}
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-xs text-muted-foreground font-medium">GBP</span>
                        </div>
                        {validationError === "spend" && (
                          <p className="text-xs text-destructive mt-1">Spend on Supplier is required.</p>
                        )}
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
                            className={`relative flex flex-col items-start gap-1 rounded-lg border-2 p-2.5 text-left transition-all duration-150 ${
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
                            className={`relative flex flex-col items-start gap-1 rounded-lg border-2 p-2.5 text-left transition-all duration-150 ${
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
                        <div className="space-y-3">
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
                        <div className="space-y-3">
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reporting & Targets</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <Label>Targets</Label>
                      <Select
                        value={draft.targetStatus}
                        onValueChange={handleTargetChange}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sbti-validated">SBTi Validated</SelectItem>
                          <SelectItem value="sbti-committed">SBTi Committed</SelectItem>
                          <SelectItem value="sbti-inherited">SBTi Inherited</SelectItem>
                          <SelectItem value="self-published">Self Published</SelectItem>
                          <SelectItem value="no-targets">No Targets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    </div>

                    {/* SBT Aligned */}
                    <div>
                      <Label>SBT Aligned?</Label>
                      {(() => {
                        const aligned = deriveSbtAligned(draft.targetStatus);
                        return (
                          <>
                            <Select
                              value={draft.sbtAligned ? "yes" : "no"}
                              onValueChange={(v) => update("sbtAligned", v === "yes")}
                              disabled={aligned.locked}
                            >
                              <SelectTrigger className={`mt-1 ${aligned.locked ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {!aligned.locked && draft.targetStatus === "self-published" && (
                              <p className="text-[11px] text-amber-600 mt-1">
                                Please verify whether self-published targets are SBTi aligned
                              </p>
                            )}
                          </>
                        );
                      })()}
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
                      onClick={() => {
                        setDraft((prev) => prev ? { ...prev, calculationMethodology: "tco2e" as const, tco2e: 0 } : prev);
                        setValidationError(null);
                      }}
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

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-150"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <div className="flex gap-2">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AlertDialog open={!!overrideConfirm} onOpenChange={(open) => !open && setOverrideConfirm(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Override {overrideConfirm?.field} Data?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to override the "{overrideConfirm?.field}" data of the AI Database? This will replace the automatically synced value with your manual selection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            overrideConfirm?.applyChange();
            setOverrideConfirm(null);
          }}>
            Override
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{draft?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (draft && onDelete) {
                onDelete(draft.id);
                onClose();
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};
