import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Cloud, Info } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  year: number;
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

export const AddSupplierModal = ({ open, onClose, onSave, year }: AddSupplierModalProps) => {
  const [name, setName] = useState("");
  const [hqCountry, setHqCountry] = useState("");
  const [category, setCategory] = useState("");
  const [calcMethod, setCalcMethod] = useState<"spend" | "tco2e">("spend");
  const [spend, setSpend] = useState(0);
  const [tco2e, setTco2e] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const canSave = name.trim() && hqCountry && category && (
    calcMethod === "spend" ? spend > 0 : tco2e > 0);

  const handleSave = () => {
    if (!canSave) return;

    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name: name.trim(),
      industry: "Other",
      description: "",
      tco2e: calcMethod === "tco2e" ? tco2e : 0,
      spend,
      hasTargets: false,
      cdp: false,
      category,
      synced: false,
      emissionFactor: 0,
      methodology: "Industry benchmark",
      hqCountry,
      website: website.trim(),
      calculationMethodology: calcMethod,
    };

    onSave(newSupplier);
    setName("");
    setHqCountry("");
    setCategory("");
    setCalcMethod("spend");
    setSpend(0);
    setTco2e(0);
    setEmail("");
    setPhone("");
    setWebsite("");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
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

            <h2 className="text-lg font-semibold text-foreground mb-5">Add Supplier</h2>

            {/* Supplier Info */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Supplier Info</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <Label htmlFor="add-name">Name *</Label>
                  <Input
                    id="add-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <Label>Geography *</Label>
                  <Select value={hqCountry} onValueChange={setHqCountry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Label>Category *</Label>
                    <div className="group relative">
                      <Info size={13} className="text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 rounded-lg bg-foreground px-3 py-2 text-xs text-background opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-20">
                        Which business category does this supplier belong to? If unsure, select Purchased Goods & Services.
                      </div>
                    </div>
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="add-url">URL</Label>
                  <Input
                    id="add-url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Calculation Data */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calculation Data</p>

              <Label className="mb-2 block">How do you want to calculate emissions? *</Label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setCalcMethod("spend")}
                  className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                    calcMethod === "spend"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className={calcMethod === "spend" ? "text-accent" : "text-muted-foreground"} />
                    <span className="text-sm font-medium text-foreground">I have spend data</span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug">
                    We'll estimate emissions using your annual spend with this supplier.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcMethod("tco2e")}
                  className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 ${
                    calcMethod === "tco2e"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cloud size={16} className={calcMethod === "tco2e" ? "text-accent" : "text-muted-foreground"} />
                    <span className="text-sm font-medium text-foreground">I have CO₂e data</span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug">
                    Enter emissions provided by the supplier directly.
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <Label htmlFor="add-spend">
                    Spend on Supplier in {year}
                    {calcMethod === "spend" && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="add-spend"
                      type="number"
                      value={spend}
                      onChange={(e) => setSpend(Number(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      GBP
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {calcMethod === "spend"
                      ? "Used to estimate emissions."
                      : "Optional input — not used in calculation"}
                  </p>
                </div>

                <div className={calcMethod === "spend" ? "opacity-50" : ""}>
                  <Label htmlFor="add-tco2e">
                    tCO₂e
                    {calcMethod === "tco2e" && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id="add-tco2e"
                    type="number"
                    step="0.01"
                    value={tco2e}
                    onChange={(e) => setTco2e(Number(e.target.value))}
                    className="mt-1"
                    disabled={calcMethod === "spend"}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {calcMethod === "tco2e"
                      ? "Total CO₂ equivalent from supplier disclosure"
                      : "This will be auto-calculated"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
