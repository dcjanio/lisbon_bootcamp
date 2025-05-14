import { useCurrentAccount } from "@mysten/dapp-kit";
import { Flex, Text, Box, Card } from "@radix-ui/themes";
import { formatAddress } from "@mysten/sui/utils";

export function WalletStatus() {
  const account = useCurrentAccount();

  if (account) {
    const chainName = account.chains && account.chains.length > 0 
      ? typeof account.chains[0] === 'object' && 'name' in account.chains[0] 
        ? (account.chains[0] as any).name
        : 'Sui Network'
      : 'Sui Network';
      
    // Format the address for display
    const shortAddress = formatAddress(account.address);
    
    return (
      <Card style={{ 
        backgroundColor: 'transparent', 
        borderRadius: '8px',
        border: '1px solid rgba(58, 134, 255, 0.3)'
      }}>
        <Flex p="3" justify="between" align="center">
          <Flex align="center" gap="3">
            <div style={{ 
              backgroundColor: 'rgba(58, 134, 255, 0.15)', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box style={{ 
                backgroundColor: '#3a86ff', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%',
              }} />
            </div>
            <Box>
              <Text weight="medium" size="2">{shortAddress}</Text>
              <Flex align="center" gap="1">
                <Box style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%',
                  backgroundColor: '#22c55e' 
                }} />
                <Text size="1" color="gray">{chainName}</Text>
              </Flex>
            </Box>
          </Flex>
          
          <Box style={{
            backgroundColor: 'rgba(58, 134, 255, 0.15)',
            padding: '4px 8px',
            borderRadius: '4px',
          }}>
            <Text size="1" style={{ color: '#3a86ff' }}>Connected</Text>
          </Box>
        </Flex>
      </Card>
    );
  }
  
  return (
    <Card style={{ 
      backgroundColor: 'rgba(0,0,0,0.1)', 
      borderRadius: '8px',
      padding: '12px',
      textAlign: 'center'
    }}>
      <Text>Wallet not connected</Text>
    </Card>
  );
}
