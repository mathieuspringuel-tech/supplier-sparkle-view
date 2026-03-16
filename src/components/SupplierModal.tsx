import { motion, AnimatePresence } from "framer-motion";
import { X, Globe } from "lucide-react";
import type { Supplier } from "@/data/suppliers";

interface SupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

export const SupplierModal = ({ supplier, onClose }: SupplierModalProps) => {
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
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-md bg-card rounded-xl p-6 shadow-[0_0_0_1px_rgba(0,0,0,.08),0_20px_25px_-5px_rgba(0,0,0,.1),0_10px_10px_-5px_rgba(0,0,0,.04)] z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X size={16} />
            </button>

            <header className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{supplier.name}</h2>
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors duration-150"
                  title={supplier.website}
                >
                  <Globe size={15} />
                </a>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>{supplier.hqFlag}</span>
                <span>{supplier.industry}</span>
              </p>
            </header>

            <div className="space-y-5">
              <section>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Description
                </label>
                <p className="text-sm text-muted-foreground/80 leading-relaxed mt-1">
                  {supplier.description}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <section>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Emission Factor / $
                  </label>
                  <p className="text-xl font-mono-tabular font-medium text-foreground mt-1">
                    {supplier.emissionFactor.toFixed(3)}
                    <span className="text-xs text-muted-foreground ml-1">kgCO2e</span>
                  </p>
                </section>

                <section>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Methodology
                  </label>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        supplier.methodology === "Supplier specific"
                          ? "bg-confidence-high-bg text-confidence-high-text border-confidence-high-border"
                          : "bg-confidence-low-bg text-confidence-low-text border-confidence-low-border"
                      }`}
                    >
                      {supplier.methodology}
                    </span>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
