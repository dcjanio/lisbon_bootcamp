import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

/**
 * Helper function to execute a Sui CLI command
 */
export async function executeSuiCommand(command: string): Promise<{ stdout: string, stderr: string }> {
  console.log(`Executing command: ${command}`);
  try {
    const result = await execAsync(command);
    return result;
  } catch (error: any) {
    console.error(`Error executing command: ${error.message}`);
    console.error(`Command stdout: ${error.stdout}`);
    console.error(`Command stderr: ${error.stderr}`);
    throw error;
  }
}

/**
 * Helper function to extract object IDs from command output
 */
export function extractObjectIds(output: string): string[] {
  const objectIds: string[] = [];
  
  // Extract created object IDs
  const createdRegex = /Created.*(Objects|IDs)[\s\S]*?(?:0x[a-f0-9]+)/g;
  const matches = output.match(createdRegex);
  
  if (matches) {
    for (const match of matches) {
      const idMatch = /(?:0x[a-f0-9]+)/g;
      let idResult;
      while ((idResult = idMatch.exec(match)) !== null) {
        objectIds.push(idResult[0]);
      }
    }
  }
  
  return objectIds;
}

/**
 * Helper function to extract transaction digest from output
 */
export function extractTransactionDigest(output: string): string | null {
  const digestMatch = /Transaction Digest:\s*([a-zA-Z0-9]+)/;
  const match = output.match(digestMatch);
  return match ? match[1] : null;
}

/**
 * Helper function to extract gas cost from output
 */
export function extractGasCost(output: string): { storage: number, computation: number, storageRebate: number } {
  const storageCostMatch = /Storage Cost:\s*(\d+)/;
  const computationCostMatch = /Computation Cost:\s*(\d+)/;
  const storageRebateMatch = /Storage Rebate:\s*(\d+)/;
  
  const storage = output.match(storageCostMatch)?.[1] ? parseInt(output.match(storageCostMatch)![1]) : 0;
  const computation = output.match(computationCostMatch)?.[1] ? parseInt(output.match(computationCostMatch)![1]) : 0;
  const storageRebate = output.match(storageRebateMatch)?.[1] ? parseInt(output.match(storageRebateMatch)![1]) : 0;
  
  return { storage, computation, storageRebate };
} 