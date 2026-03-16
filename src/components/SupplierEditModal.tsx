import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      onSave(draft);
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

            <Tabs defaultValue="year-results">
              <TabsList className="w-full">
                <TabsTrigger value="year-results" className="flex-1">Year Results</TabsTrigger>
                <TabsTrigger value="supplier-data" className="flex-1">Supplier Data</TabsTrigger>
              </TabsList>

              <TabsContent value="year-results" className="space-y-4 pt-4">
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

                <div>
                  <Label>Category</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(v) => update("category", v)}
                  >
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
              </TabsContent>

              <TabsContent value="supplier-data" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    value={draft.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>HQ Country</Label>
                  <Select
                    value={draft.hqCountry}
                    onValueChange={(v) => update("hqCountry", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Industry</Label>
                  <Select
                    value={draft.industry}
                    onValueChange={(v) => update("industry", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
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
