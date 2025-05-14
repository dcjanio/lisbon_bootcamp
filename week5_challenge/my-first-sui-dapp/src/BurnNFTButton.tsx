import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Text, Flex } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Contract address from our newly deployed package
const PACKAGE_ID = "0x9e6ff5ba2d519ffd3c6de890343fa1c3f2e8354a8cd4f216704a6c494354c492";
const MODULE_NAME = "dropout"; // The Move module name
const FUNCTION_NAME = "burn";   // The function name in the module

interface BurnNFTButtonProps {
  objectId: string;
  name: string;
}

export const BurnNFTButton = ({ objectId, name }: BurnNFTButtonProps) => {
  const queryClient = useQueryClient();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction, isPending: isSigning } = useSignTransaction();
  const suiClient = useSuiClient();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState("");

  const handleBurnNFT = async () => {
    if (!confirm(`Are you sure you want to burn "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      
      if (!account) {
        setError("Please connect your wallet");
        return;
      }

      // Create a new transaction block
      const tx = new Transaction();
      tx.setSender(account.address);

      // Build the full target path with the format: PackageID::ModuleName::FunctionName
      const fullTarget = `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`;
      
      console.log("Calling function:", fullTarget);
      console.log("With object ID:", objectId);

      // Call the burn function with the NFT object
      tx.moveCall({
        target: fullTarget,
        arguments: [
          tx.object(objectId),
        ],
      });
      
      const { bytes, signature } = await signTransaction({
        transaction: tx,
      });
      
      // Auto-execute after signing
      executeTransaction(bytes, signature);
    } catch (err) {
      console.error("Transaction signing failed", err);
      setError("Failed to sign transaction: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const executeTransaction = async (txBytes: string, txSignature: string) => {
    try {
      setIsExecuting(true);
      
      const response = await suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: txSignature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });
      
      console.log("Transaction executed", response);
      
      if (response.effects?.status.status !== "success") {
        setError(`Transaction failed: ${response.effects?.status.error || 'Unknown error'}`);
        setIsExecuting(false);
        return;
      }
      
      // Wait for transaction to be confirmed
      await suiClient.waitForTransaction({ digest: response.digest });
      
      // Reset form state
      setIsExecuting(false);
      
      // Refresh queries
      queryClient.invalidateQueries({
        queryKey: ["devnet", "getOwnedObjects"],
      });
      
    } catch (err) {
      console.error("Transaction execution failed", err);
      setError("Failed to execute transaction: " + (err instanceof Error ? err.message : String(err)));
      setIsExecuting(false);
    }
  };

  return (
    <Flex direction="column" gap="2">
      <Button 
        color="red" 
        size="1"
        variant="soft"
        onClick={handleBurnNFT} 
        disabled={isSigning || isExecuting}
        style={{ 
          opacity: isSigning || isExecuting ? 0.6 : 1
        }}
      >
        {isSigning ? 'Signing...' : isExecuting ? 'Burning...' : 'Burn NFT'}
      </Button>
      
      {error && (
        <Text color="red" size="1">Error: {error}</Text>
      )}
    </Flex>
  );
}; 