import { useState } from "react";
import { SupplierTable } from "@/components/SupplierTable";
import { InsightDashboard } from "@/components/InsightDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Table2, BarChart3 } from "lucide-react";
import { initialYearData } from "@/data/suppliers";

const Index = () => {
  const [selectedYear, setSelectedYear] = useState(initialYearData[0].year);
  const currentYearData = initialYearData.find(y => y.year === selectedYear) || initialYearData[0];

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

      <main className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="suppliers" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="suppliers" className="gap-1.5">
              <Table2 size={14} />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="insight" className="gap-1.5">
              <BarChart3 size={14} />
              Insight
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers">
            <SupplierTable />
          </TabsContent>

          <TabsContent value="insight">
            <InsightDashboard suppliers={currentYearData.suppliers} year={selectedYear} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
