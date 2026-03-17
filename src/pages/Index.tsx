import { SupplierTable } from "@/components/SupplierTable";
import { Download } from "lucide-react";

const Index = () => {
  const handleDownloadSpec = () => {
    const link = document.createElement("a");
    link.href = "/supplier-module-spec.md";
    link.download = "supplier-module-spec.md";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">
            Measurement / <span className="text-muted-foreground font-normal">Suppliers</span>
          </h1>
          <button
            onClick={handleDownloadSpec}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors duration-150"
          >
            <Download size={14} />
            Download Spec
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <SupplierTable />
      </main>
    </div>
  );
};

export default Index;
