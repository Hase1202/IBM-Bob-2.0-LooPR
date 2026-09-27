"use client";

import { useState } from "react";
import {
  exportContractAsMarkdown,
  exportContractAsJson,
  ContractExportData,
} from "@/lib/contracts/export";

export function ExportContractButton({ contract }: { contract: ContractExportData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (format: "markdown" | "json") => {
    const text =
      format === "markdown"
        ? exportContractAsMarkdown(contract)
        : exportContractAsJson(contract);

    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (format: "markdown" | "json") => {
    const text =
      format === "markdown"
        ? exportContractAsMarkdown(contract)
        : exportContractAsJson(contract);

    const blob = new Blob([text], {
      type: format === "markdown" ? "text/markdown" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-${contract.feature.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${
      format === "markdown" ? "md" : "json"
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleCopy("markdown")}
        className="text-xs px-2.5 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-colors"
      >
        {copied === "markdown" ? "✓ Copied MD" : "Copy as MD"}
      </button>
      <button
        onClick={() => handleDownload("json")}
        className="text-xs px-2.5 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-colors"
      >
        Export JSON
      </button>
    </div>
  );
}
