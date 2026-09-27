"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContractActions({ 
  owner, 
  repo, 
  contractId 
}: { 
  owner: string; 
  repo: string; 
  contractId: string 
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/repositories/${owner}/${repo}/contracts/${contractId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(`/repositories/${owner}/${repo}`);
        router.refresh();
      } else {
        alert("Failed to delete contract");
      }
    } catch (e) {
      alert("Error deleting contract");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1.5 rounded border border-[#f85149]/50 text-[#f85149] hover:bg-[#f85149]/10 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete Contract"}
      </button>
    </div>
  );
}
