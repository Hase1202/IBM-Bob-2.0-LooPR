export interface ContractExportData {
  id: string;
  feature: string;
  status: string;
  createdAt: Date | string;
  contractJson: string;
}

export function exportContractAsMarkdown(contract: ContractExportData): string {
  let parsed: any = {};
  try {
    parsed = JSON.parse(contract.contractJson);
  } catch {
    parsed = {};
  }

  const requirements = (parsed.requirements as string[]) ?? [];
  const rules = (parsed.architectureRules as { id: string; description: string }[]) ?? [];
  const forbidden = (parsed.forbiddenPatterns as string[]) ?? [];

  return `# Architectural Contract: ${contract.feature}
**Status:** ${contract.status.toUpperCase()}  
**Contract ID:** \`${contract.id}\`  
**Created:** ${new Date(contract.createdAt).toLocaleDateString()}

## Requirements
${requirements.length > 0 ? requirements.map((r) => `- ${r}`).join("\n") : "_None specified_"}

## Architecture Rules
${rules.length > 0 ? rules.map((r) => `- **${r.id}**: ${r.description}`).join("\n") : "_None specified_"}

## Forbidden Patterns
${forbidden.length > 0 ? forbidden.map((f) => `- ❌ ${f}`).join("\n") : "_None specified_"}
`;
}

export function exportContractAsJson(contract: ContractExportData): string {
  try {
    const parsed = JSON.parse(contract.contractJson);
    return JSON.stringify(
      {
        id: contract.id,
        feature: contract.feature,
        status: contract.status,
        createdAt: contract.createdAt,
        specification: parsed,
      },
      null,
      2
    );
  } catch {
    return JSON.stringify(contract, null, 2);
  }
}
