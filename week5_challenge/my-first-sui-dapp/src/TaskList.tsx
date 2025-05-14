import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text, Box, Card } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSuiClientQuery } from "@mysten/dapp-kit";

// Contract addresses (match with CreateTaskForm)
const PACKAGE_ID = "0x88a821d0e5fbbd1d2b86470182aff1061d402e042296e574b7171f72646b03e9";
const TASK_LIST_ID = "0x67acba66f6e393ba2fbb08052b15d25af70af24b4637f5b043d4ef533f8b028f";

// Task interface
interface TaskItem {
  objectId: string;
  name: string;
  description: string;
  completed: boolean;
  priority: number;
  imageUrl: string;
}

export const TaskList = () => {
  const queryClient = useQueryClient();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();
  
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  
  // Query owned objects
  const { data: ownedObjects, isLoading, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: {
        showContent: true,
        showType: true,
        showDisplay: true,
      },
      filter: {
        MatchAll: [
          {
            StructType: `${PACKAGE_ID}::todo_list::TaskNFT`,
          },
        ],
      },
    },
    {
      enabled: !!account,
    }
  );
  
  // Process owned objects to extract task data
  useEffect(() => {
    if (!isLoading && ownedObjects) {
      try {
        const taskList = ownedObjects.data.map((obj: any) => {
          const content = obj.data?.content;
          const fields = content?.fields || {};
          const display = obj.data?.display?.data || {};
          
          return {
            objectId: obj.data?.objectId,
            name: fields.name || "Unnamed Task",
            description: fields.description || "",
            completed: fields.completed || false,
            priority: parseInt(fields.priority) || 2,
            imageUrl: fields.image_url || display.image_url || "/task_placeholder.png",
          };
        });
        
        // Sort tasks by priority (high to low) and completion status
        taskList.sort((a, b) => {
          // First sort by completion status (uncompleted first)
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Then by priority (high to low)
          return b.priority - a.priority;
        });
        
        setTasks(taskList);
        setLoading(false);
      } catch (err) {
        console.error("Error processing task data", err);
        setError("Failed to load tasks");
        setLoading(false);
      }
    }
  }, [ownedObjects, isLoading]);
  
  // Complete task function
  const handleCompleteTask = async (taskId: string) => {
    try {
      setProcessingTask(taskId);
      
      if (!account) {
        setError("Please connect your wallet");
        setProcessingTask(null);
        return;
      }

      const tx = new Transaction();
      tx.setSender(account.address);

      // Call complete_task function with correct arguments
      tx.moveCall({
        target: `${PACKAGE_ID}::todo_list::complete_task`,
        arguments: [
          tx.object(taskId),
        ],
      });
      
      const { bytes, signature } = await signTransaction({
        transaction: tx,
      });
      
      // Execute transaction
      await executeTransaction(bytes, signature, "complete");
    } catch (err) {
      console.error("Complete task transaction failed", err);
      setError("Failed to complete task: " + (err instanceof Error ? err.message : String(err)));
      setProcessingTask(null);
    }
  };
  
  // Delete task function
  const handleDeleteTask = async (taskId: string) => {
    try {
      setProcessingTask(taskId);
      
      if (!account) {
        setError("Please connect your wallet");
        setProcessingTask(null);
        return;
      }

      const tx = new Transaction();
      tx.setSender(account.address);

      // Call burn_task function with correct arguments
      tx.moveCall({
        target: `${PACKAGE_ID}::todo_list::burn_task`,
        arguments: [
          tx.object(TASK_LIST_ID),
          tx.object(taskId),
        ],
      });
      
      const { bytes, signature } = await signTransaction({
        transaction: tx,
      });
      
      // Execute transaction
      await executeTransaction(bytes, signature, "delete");
    } catch (err) {
      console.error("Delete task transaction failed", err);
      setError("Failed to delete task: " + (err instanceof Error ? err.message : String(err)));
      setProcessingTask(null);
    }
  };
  
  // Execute transaction helper
  const executeTransaction = async (txBytes: string, txSignature: string, action: string) => {
    try {
      const response = await suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: txSignature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });
      
      console.log(`${action} transaction response:`, response);
      
      if (response.effects?.status.status !== "success") {
        setError(`Transaction failed: ${response.effects?.status.error || 'Unknown error'}`);
        setProcessingTask(null);
        return;
      }
      
      // Wait for transaction to be confirmed
      await suiClient.waitForTransaction({ digest: response.digest });
      
      // Refresh queries
      queryClient.invalidateQueries({
        queryKey: ["devnet", "getOwnedObjects"],
      });
      
      refetch();
      setProcessingTask(null);
    } catch (err) {
      console.error(`Task ${action} failed`, err);
      setError(`Failed to ${action} task: ` + (err instanceof Error ? err.message : String(err)));
      setProcessingTask(null);
    }
  };
  
  // Return loading state or empty state
  if (loading) {
    return (
      <Box p="4" style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <Text>Loading your task NFTs...</Text>
      </Box>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <Box p="4" style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
        <Text size="3" mb="2">No task NFTs yet</Text>
        <Text size="2" color="gray">Your task NFTs will appear here once you create them</Text>
      </Box>
    );
  }
  
  // Render task list
  return (
    <Flex direction="column" gap="3">
      {error && (
        <Text color="red" size="2">{error}</Text>
      )}
      
      {tasks.map((task) => (
        <Card key={task.objectId} style={{ 
          backgroundColor: task.completed ? 'rgba(0,150,0,0.1)' : 'rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          transition: 'all 0.2s ease',
        }}>
          <Flex justify="between" align="start" p="3">
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Flex align="center" gap="2">
                <Text 
                  size="3" 
                  weight="medium"
                  style={{ 
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'gray' : 'white'
                  }}
                >
                  {task.name}
                </Text>
                <Box style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'gray'
                }}>
                  NFT
                </Box>
              </Flex>
              
              {task.description && (
                <Text 
                  size="2" 
                  style={{ 
                    color: task.completed ? 'gray' : 'rgba(255,255,255,0.7)',
                    marginBottom: '8px'
                  }}
                >
                  {task.description}
                </Text>
              )}
              
              <Flex gap="3">
                <Text size="1" color="gray">Priority: {getPriorityLabel(task.priority)}</Text>
                <Text size="1" color="gray">Status: {task.completed ? 'Completed' : 'Active'}</Text>
              </Flex>
            </Flex>
            
            <Flex gap="2" align="center">
              {!task.completed && (
                <Button 
                  size="1" 
                  onClick={() => handleCompleteTask(task.objectId)}
                  disabled={processingTask === task.objectId}
                  style={{ backgroundColor: '#22c55e' }}
                >
                  {processingTask === task.objectId ? '...' : '✓'}
                </Button>
              )}
              
              <Button 
                size="1" 
                onClick={() => handleDeleteTask(task.objectId)}
                disabled={processingTask === task.objectId}
                style={{ backgroundColor: '#ef4444' }}
              >
                {processingTask === task.objectId ? '...' : '×'}
              </Button>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

// Helper functions for display
const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1: return '#60a5fa'; // Low - blue
    case 2: return '#f59e0b'; // Medium - yellow
    case 3: return '#ef4444'; // High - red
    default: return '#60a5fa';
  }
};

const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    default: return 'Unknown';
  }
}; 