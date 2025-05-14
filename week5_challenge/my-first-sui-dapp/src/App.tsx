import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { Balances } from "./Balances";
import { TaskList } from "./TaskList";
import { CreateTaskForm } from "./CreateTaskForm";
import { useCurrentAccount } from "@mysten/dapp-kit";

function App() {
  const account = useCurrentAccount();
  
  return (
    <Container size="3">
      <Flex direction="column" gap="5" p="5">
        <Box mb="4">
          <Heading size="8" mb="2" style={{ background: 'linear-gradient(to right, #3a86ff, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sui Task NFTs
          </Heading>
          <Text size="2" color="gray">Mint, complete and burn your tasks as NFTs on the Sui blockchain</Text>
        </Box>
        
        <Flex justify="end" mb="2">
          <ConnectButton />
        </Flex>
        
        {account && (
          <Flex direction="column" gap="5">
            <WalletStatus />
            
            <Balances />
            
            <Box style={{ 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Heading size="5" mb="3">Mint a New Task NFT</Heading>
              <Text size="2" mb="3" color="gray">Create a new task as an NFT on the Sui blockchain</Text>
              <CreateTaskForm />
            </Box>
            
            <Box style={{ 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Heading size="5" mb="3">Your Task NFTs</Heading>
              <TaskList />
            </Box>
          </Flex>
        )}
        
        {!account && (
          <Box 
            p="6" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              borderRadius: '10px', 
              textAlign: 'center',
              marginTop: '40px',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(58, 134, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              🖼️
            </div>
            <Heading size="6" mb="3">Welcome to Sui Task NFTs</Heading>
            <Text mb="4">Connect your wallet to start minting task NFTs</Text>
            <Box style={{ marginTop: '20px' }}>
              <ConnectButton />
            </Box>
          </Box>
        )}
        
        <Box style={{ textAlign: 'center', marginTop: '40px' }}>
          <Text size="1" color="gray">Created for the Lisbon Bootcamp Week 5 Challenge</Text>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
