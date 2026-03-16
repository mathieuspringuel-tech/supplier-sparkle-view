import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const BulkUploadModal = ({ open, onClose }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Company HQ (Country Code)", "Category", "Email", "Phone", "URL", "Spend", "tCO2e"];
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suppliers_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    toast.success(`Uploaded ${file.name} — processing suppliers…`);
    setFile(null);
    onClose();
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Download the suppliers template to fill in the required details before importing.
            </p>
            <Button size="sm" onClick={handleDownloadTemplate} className="gap-2">
              <Download size={14} />
              Download
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Select the file to import suppliers:</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${
                dragOver
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Select your file."}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="gap-2">
              <X size={14} />
              Cancel
            </Button>
            <Button onClick={handleUpload} className="gap-2">
              <Upload size={14} />
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
