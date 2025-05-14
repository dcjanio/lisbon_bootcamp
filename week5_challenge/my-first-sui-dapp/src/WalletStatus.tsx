import { useCurrentAccount } from "@mysten/dapp-kit";
import { Flex, Text, Box } from "@radix-ui/themes";
import { formatAddress } from "@mysten/sui/utils";

export function WalletStatus() {
  const account = useCurrentAccount();

  if (account) {
    const chainName = account.chains && account.chains.length > 0 
      ? typeof account.chains[0] === 'object' && 'name' in account.chains[0] 
        ? (account.chains[0] as any).name
        : 'Sui Network'
      : 'Sui Network';
      
    return (
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">Connected Address</Text>
        <Flex align="center" gap="2">
          <Box style={{ 
            backgroundColor: '#3a86ff', 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%',
            display: 'inline-block'
          }} />
          <Text weight="medium">{formatAddress(account.address)}</Text>
          <Text size="1" color="gray" style={{ marginLeft: 'auto' }}>{chainName}</Text>
        </Flex>
      </Flex>
    );
  }
  
  return <Text>Wallet not connected</Text>;
}
