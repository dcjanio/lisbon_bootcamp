import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { Button, Flex, Text, Box, Card } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Contract addresses from our newly deployed package
const PACKAGE_ID = "0x9e6ff5ba2d519ffd3c6de890343fa1c3f2e8354a8cd4f216704a6c494354c492";
const COLLECTION_ID = "0x12c868681d1178a0873baf5b1f4a8da0f7e641f3a7acbd971642446ede093e50";

// Payment token options
const PAYMENT_TOKENS = {
  SUI: {
    type: "0x2::sui::SUI",
    amount: 10000000, // 0.01 SUI
    label: "SUI"
  },
  SIX: {
    type: "0x389d4517d5bf5e2b24881c365a0c4f7ad599e78ffb951c0da79ddf649ab8e058::six::SIX",
    amount: 1,
    label: "SIX"
  }
};

export const MintNFTForm = () => {
  const queryClient = useQueryClient();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction, isPending: isSigning } = useSignTransaction();
  const suiClient = useSuiClient();
  
  const [name, setName] = useState("My Dropout NFT");
  const [imageUrl, setImageUrl] = useState("https://i.imgur.com/yvNbUed.png");
  const [paymentToken, setPaymentToken] = useState<"SUI" | "SIX">("SUI");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignTransaction = async () => {
    try {
      setError("");
      setIsSuccess(false);
      
      if (!name || !imageUrl) {
        setError("Please fill in all fields");
        return;
      }
      
      if (!account) {
        setError("Please connect your wallet");
        return;
      }

      const tx = new Transaction();
      tx.setSender(account.address);

      // Use the selected token for payment
      const selectedToken = PAYMENT_TOKENS[paymentToken];
      
      // Create payment coin object
      const payment = coinWithBalance({
        balance: selectedToken.amount,
        type: selectedToken.type,
        // Use the gas coin only for SUI payments
        useGasCoin: paymentToken === "SUI"
      })(tx);

      // Different method call depending on token
      if (paymentToken === "SUI") {
        // For SUI, use the special entry function
        tx.moveCall({
          target: `${PACKAGE_ID}::dropout::buy_with_sui`,
          arguments: [
            tx.object(COLLECTION_ID),
            tx.pure.string(name),
            tx.pure.string(imageUrl),
            payment,
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        });
      } else {
        // For other tokens like SIX, use the generic buy function
        // and manually transfer the NFT afterward
        const nft = tx.moveCall({
          target: `${PACKAGE_ID}::dropout::buy`,
          typeArguments: [selectedToken.type],
          arguments: [
            tx.object(COLLECTION_ID),
            tx.pure.string(name),
            tx.pure.string(imageUrl),
            payment,
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        });
        
        // Transfer the NFT to the sender
        tx.transferObjects([nft], account.address);
      }
      
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
      setIsSuccess(true);
      
      // Refresh queries
      queryClient.invalidateQueries({
        queryKey: ["devnet", "getOwnedObjects"],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["devnet", "getAllBalances"],
      });
    } catch (err) {
      console.error("Transaction execution failed", err);
      setError("Failed to execute transaction: " + (err instanceof Error ? err.message : String(err)));
      setIsExecuting(false);
    }
  };

  if (!account) {
    return null;
  }

  return (
    <Card style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
      <Flex direction="column" gap="3" p="3">
        {!isSuccess ? (
          <>
            <input 
              placeholder="NFT Name" 
              value={name} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white'
              }}
            />
            
            <input 
              placeholder="Image URL" 
              value={imageUrl} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white'
              }}
            />
            
            {imageUrl && (
              <Box 
                style={{ 
                  width: '100%', 
                  maxHeight: '200px', 
                  overflow: 'hidden', 
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}
              >
                <img 
                  src={imageUrl} 
                  alt="NFT Preview" 
                  style={{
                    width: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#111',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </Box>
            )}
            
            <Flex gap="2" align="center">
              <Text size="2">Pay with:</Text>
              <Flex gap="2">
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: paymentToken === 'SUI' ? 'rgba(58, 134, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(58, 134, 255, 0.3)'
                }}>
                  <input 
                    type="radio" 
                    name="paymentToken" 
                    value="SUI" 
                    checked={paymentToken === "SUI"} 
                    onChange={() => setPaymentToken("SUI")}
                    style={{ marginRight: '4px' }}
                  />
                  SUI (0.01)
                </label>
                
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: paymentToken === 'SIX' ? 'rgba(58, 134, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(58, 134, 255, 0.3)'
                }}>
                  <input 
                    type="radio" 
                    name="paymentToken" 
                    value="SIX" 
                    checked={paymentToken === "SIX"} 
                    onChange={() => setPaymentToken("SIX")}
                    style={{ marginRight: '4px' }}
                  />
                  SIX (1)
                </label>
              </Flex>
            </Flex>
            
            {error && (
              <Text color="red" size="2">{error}</Text>
            )}
            
            <Button 
              onClick={handleSignTransaction} 
              disabled={isSigning || isExecuting || !name || !imageUrl}
              style={{ 
                backgroundColor: isSigning || isExecuting ? 'rgba(255,255,255,0.1)' : '#3a86ff'
              }}
            >
              {isSigning ? 'Signing...' : isExecuting ? 'Executing...' : `Mint NFT with ${paymentToken}`}
            </Button>
          </>
        ) : (
          <Flex direction="column" align="center" gap="3" p="4">
            <Text size="5">🎉 NFT Minted Successfully!</Text>
            <Text size="2" color="gray">Your new Dropout NFT has been added to your collection</Text>
            <Button onClick={() => setIsSuccess(false)}>Mint Another</Button>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
