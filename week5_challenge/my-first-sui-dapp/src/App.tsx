import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text, Separator } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { Balances } from "./Balances";
import { OwnedObjects } from "./OwnedObjects";
import { MintNFTForm } from "./MintNFTForm";
import { useCurrentAccount } from "@mysten/dapp-kit";

function App() {
  const account = useCurrentAccount();
  
  return (
    <Container size="3">
      <Flex direction="column" gap="5" p="5">
        <Box mb="4">
          <Heading size="8" mb="2">Dropout NFT Minter</Heading>
          <Text size="2" color="gray">Connect your wallet to mint exclusive Dropout NFTs on Sui</Text>
        </Box>
        
        <Flex justify="end">
          <ConnectButton />
        </Flex>
        
        {account && (
          <>
            <Box p="4" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <WalletStatus />
            </Box>
            
            <Separator size="4" />
            
            <Box>
              <Heading size="5" mb="3">Your Balances</Heading>
              <Balances />
            </Box>
            
            <Separator size="4" />
            
            <Box>
              <Heading size="5" mb="3">Mint a New Dropout NFT</Heading>
              <Text size="2" mb="3" color="gray">Create your personalized Dropout NFT with SUI or SIX tokens</Text>
              <MintNFTForm />
            </Box>
            
            <Separator size="4" />
            
            <Box>
              <Heading size="5" mb="3">Your Dropout NFT Collection</Heading>
              <OwnedObjects />
            </Box>
          </>
        )}
        
        {!account && (
          <Box 
            p="6" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px', 
              textAlign: 'center',
              marginTop: '40px'
            }}
          >
            <Heading size="6" mb="3">👋 Welcome to Dropout NFT Minter</Heading>
            <Text mb="4">Please connect your Slush Wallet to get started</Text>
          </Box>
        )}
      </Flex>
    </Container>
  );
}

export default App;
