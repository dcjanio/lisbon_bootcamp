import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text, Card, Select } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Contract addresses (update these with your published contract)
const PACKAGE_ID = "0x88a821d0e5fbbd1d2b86470182aff1061d402e042296e574b7171f72646b03e9";
const TASK_LIST_ID = "0x67acba66f6e393ba2fbb08052b15d25af70af24b4637f5b043d4ef533f8b028f";

// Priority levels
const PRIORITIES = {
  LOW: {
    value: 1,
    label: "Low",
    color: "#60a5fa"
  },
  MEDIUM: {
    value: 2,
    label: "Medium",
    color: "#f59e0b"
  },
  HIGH: {
    value: 3,
    label: "High",
    color: "#ef4444"
  }
};

export const CreateTaskForm = () => {
  const queryClient = useQueryClient();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction, isPending: isSigning } = useSignTransaction();
  const suiClient = useSuiClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(PRIORITIES.MEDIUM.value as 1 | 2 | 3);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTask = async () => {
    try {
      setError("");
      setIsSuccess(false);
      
      if (!name) {
        setError("Please enter a task name");
        return;
      }
      
      if (!account) {
        setError("Please connect your wallet");
        return;
      }

      const tx = new Transaction();
      tx.setSender(account.address);

      // Call mint_task function with correct arguments
      tx.moveCall({
        target: `${PACKAGE_ID}::todo_list::mint_task`,
        arguments: [
          tx.object(TASK_LIST_ID),
          tx.pure.string(name),
          tx.pure.string(description || "No description provided"),
          tx.pure.u8(priority),
        ],
      });
      
      setIsExecuting(true);
      
      const { bytes, signature } = await signTransaction({
        transaction: tx,
      });
      
      // Auto-execute after signing
      const response = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
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
      setName("");
      setDescription("");
      
      // Refresh queries
      queryClient.invalidateQueries({
        queryKey: ["devnet", "getOwnedObjects"],
      });
    } catch (err) {
      console.error("Transaction failed", err);
      setError("Failed to create task: " + (err instanceof Error ? err.message : String(err)));
      setIsExecuting(false);
    }
  };

  if (!account) {
    return null;
  }

  // Get current priority color
  const getPriorityColor = () => {
    switch (priority) {
      case 1: return PRIORITIES.LOW.color;
      case 2: return PRIORITIES.MEDIUM.color;
      case 3: return PRIORITIES.HIGH.color;
      default: return PRIORITIES.MEDIUM.color;
    }
  };

  return (
    <Card style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
      <Flex direction="column" gap="3" p="3">
        {!isSuccess ? (
          <>
            <input 
              placeholder="Task Name" 
              value={name} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                marginBottom: '8px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            
            <textarea 
              placeholder="Description (optional)" 
              value={description} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical',
                marginBottom: '8px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            
            <Flex gap="3" align="center" justify="between">
              <Flex gap="2" align="center">
                <Text size="2">Priority:</Text>
                <Select.Root 
                  value={priority.toString()} 
                  onValueChange={(value) => setPriority(parseInt(value) as 1 | 2 | 3)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="1">
                      <Flex gap="2" align="center">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PRIORITIES.LOW.color }}></div>
                        <Text>Low</Text>
                      </Flex>
                    </Select.Item>
                    <Select.Item value="2">
                      <Flex gap="2" align="center">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PRIORITIES.MEDIUM.color }}></div>
                        <Text>Medium</Text>
                      </Flex>
                    </Select.Item>
                    <Select.Item value="3">
                      <Flex gap="2" align="center">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PRIORITIES.HIGH.color }}></div>
                        <Text>High</Text>
                      </Flex>
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: getPriorityColor(),
                  marginLeft: '4px'
                }}></div>
              </Flex>
              
              <Button 
                onClick={handleCreateTask} 
                disabled={isSigning || isExecuting || !name}
                style={{ 
                  backgroundColor: isSigning || isExecuting || !name ? 'rgba(255,255,255,0.1)' : '#3a86ff',
                  transition: 'all 0.2s ease',
                  opacity: !name ? 0.5 : 1,
                  cursor: !name ? 'not-allowed' : 'pointer',
                }}
              >
                {isSigning ? 'Signing...' : isExecuting ? 'Creating...' : 'Mint Task NFT'}
              </Button>
            </Flex>
            
            {error && (
              <Text color="red" size="2">{error}</Text>
            )}
          </>
        ) : (
          <Flex direction="column" align="center" gap="3" p="4">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>✓</div>
            <Text size="5">Task NFT Created!</Text>
            <Text size="2" color="gray">Your new task has been minted as an NFT</Text>
            <Button 
              onClick={() => setIsSuccess(false)}
              style={{ backgroundColor: '#3a86ff' }}
            >
              Mint Another Task
            </Button>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}; 