"use client";

import { useState } from "react";

export function ContractNotes({
  contractId,
  owner,
  repo,
  initialNotes,
}: {
  contractId: string;
  owner: string;
  repo: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(
        `/api/repositories/${owner}/${repo}/contracts/${contractId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save notes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Contract Notes
        </h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-[#3fb950]">✓ Saved</span>
          )}
          {error && (
            <span className="text-xs text-[#f85149]">{error}</span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-1 rounded text-xs bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <textarea
        rows={6}
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        placeholder={`Add notes about this contract — architecture decisions, rules, forbidden patterns, expected interfaces, or anything the reviewer should know.\n\nExample:\n- Use the existing RateLimiter middleware (src/middleware/rate-limiter.ts)\n- Do NOT implement a custom in-memory counter\n- The limit() method signature must stay compatible with existing callers`}
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors resize-none font-mono leading-relaxed"
      />
      <p className="mt-2 text-xs text-[#8b949e]">
        These notes are included when Bob reviews a PR against this contract.
      </p>
    </div>
  );
}
