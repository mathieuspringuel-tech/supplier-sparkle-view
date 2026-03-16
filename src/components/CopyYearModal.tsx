import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { Checkbox } from "@/components/ui/checkbox";
import { getFlagUrl } from "@/data/suppliers";

interface CopyYearModalProps {
  suppliers: Supplier[];
  fromYear: number;
  toYear: number;
  onClose: () => void;
  onConfirm: (selected: Supplier[]) => void;
}

export const CopyYearModal = ({ suppliers, fromYear, toYear, onClose, onConfirm }: CopyYearModalProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(suppliers.map((s) => s.id)));

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === suppliers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suppliers.map((s) => s.id)));
    }
  };

  const handleConfirm = () => {
    const selected = suppliers.filter((s) => selectedIds.has(s.id));
    onConfirm(selected);
  };

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-md bg-card rounded-xl p-6 shadow-[0_0_0_1px_rgba(0,0,0,.08),0_20px_25px_-5px_rgba(0,0,0,.1),0_10px_10px_-5px_rgba(0,0,0,.04)] z-10 max-h-[80vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <X size={16} />
          </button>

          <h2 className="text-lg font-semibold text-foreground mb-1">
            Copy suppliers from {fromYear}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select which suppliers to copy into {toYear}. Spend and tCO2e will be reset to zero.
          </p>

          <div className="border-b border-border pb-2 mb-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <Checkbox
                checked={selectedIds.size === suppliers.length}
                onCheckedChange={toggleAll}
              />
              Select all ({selectedIds.size}/{suppliers.length})
            </label>
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {suppliers.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors duration-75"
              >
                <Checkbox
                  checked={selectedIds.has(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                />
                <img
                  src={getFlagUrl(s.hqCountry)}
                  alt={s.hqCountry}
                  width={20}
                  height={15}
                  className="rounded-[2px]"
                />
                <span className="text-sm text-foreground">{s.name}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy {selectedIds.size} supplier{selectedIds.size !== 1 ? "s" : ""}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
