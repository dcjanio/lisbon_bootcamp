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

  if (!data || data.length === 0) {
    return <Text color="gray">No coins found in this wallet</Text>;
  }

  const formatCoinName = (coinType: string) => {
    const shortName = formatAddress(coinType);
    // Extract coin name from the end of the coinType
    const parts = coinType.split("::");
    if (parts.length > 2) {
      return parts[2];
    }
    return shortName;
  };

  const formatBalance = (balance: string) => {
    const num = parseInt(balance);
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + " B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + " M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(2) + " K";
    }
    return num.toString();
  };

  return (
    <Flex direction="column" gap="2">
      {data?.map(({ totalBalance, coinType }) => (
        <Card key={coinType} style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <Flex p="3" justify="between" align="center">
            <Box>
              <Text weight="bold">{formatCoinName(coinType)}</Text>
              <Text size="1" color="gray">{formatAddress(coinType)}</Text>
            </Box>
            <Text size="5" weight="medium">{formatBalance(totalBalance)}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};
