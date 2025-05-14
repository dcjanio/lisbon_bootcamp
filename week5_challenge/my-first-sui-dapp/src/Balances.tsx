import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { Card, Flex, Text, Box } from "@radix-ui/themes";

export const Balances = () => {
  const account = useCurrentAccount();

  const { data, isLoading, isError } = useSuiClientQuery(
    "getAllBalances",
    {
      owner: account?.address || "",
    },
    {
      enabled: !!account,
    },
  );

  if (!account) return null;
  
  if (isLoading) {
    return <Text>Loading balances...</Text>;
  }
  
  if (isError) {
    return <Text color="red">Error fetching balances</Text>;
  }

  // Find SUI coin data
  const suiCoin = data?.find(coin => 
    coin.coinType === "0x2::sui::SUI"
  );

  // Always show 0 SUI regardless of actual balance
  return (
    <Card style={{ 
      backgroundColor: 'rgba(0,0,0,0.1)', 
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <Flex p="4" justify="between" align="center">
        <Flex align="center" gap="3">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(28, 70, 193, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            S
          </div>
          <Box>
            <Text weight="bold" size="4">SUI</Text>
            <Text size="1" color="gray">{formatAddress("0x2::sui::SUI")}</Text>
          </Box>
        </Flex>
        <Flex direction="column" align="end">
          <Text size="5" weight="medium">0 SUI</Text>
          <Text size="1" color="gray">Demo Balance</Text>
        </Flex>
      </Flex>
      <Box style={{ 
        backgroundColor: 'rgba(28, 70, 193, 0.1)', 
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Text size="2" style={{ textAlign: 'center' }}>
          This is a demo app - no actual SUI is required for transactions
        </Text>
      </Box>
    </Card>
  );
};
