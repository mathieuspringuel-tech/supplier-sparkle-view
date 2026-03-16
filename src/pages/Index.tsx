import { SupplierTable } from "@/components/SupplierTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">
            Measurement / <span className="text-muted-foreground font-normal">Suppliers</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <SupplierTable />
      </main>
    </div>
  );
};

export default Index;
