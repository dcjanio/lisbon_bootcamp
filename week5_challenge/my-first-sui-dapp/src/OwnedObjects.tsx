import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { Box, Card, Flex, Grid, Heading, Link, Text } from "@radix-ui/themes";

// Using the same package ID from our deployed contract
const PACKAGE_ID = "0x49c91084cf01f6fbe451ffc1b029e90bc208ac5569b57c2e4b01e5d2d1f05c40";

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isLoading, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        StructType: `${PACKAGE_ID}::dropout::Dropout`,
      },
      options: {
        showDisplay: true,
      },
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
    return null;
  }

  if (error) {
    return <Text color="red">Error fetching owned objects</Text>;
  }

  if (isLoading) {
    return <Text>Loading NFTs...</Text>;
  }

  const nfts = data?.data || [];

  if (nfts.length === 0) {
    return (
      <Box p="4" style={{ 
        backgroundColor: 'rgba(0,0,0,0.1)', 
        borderRadius: '8px', 
        textAlign: 'center' 
      }}>
        <Text>You don't own any Dropout NFTs yet</Text>
        <Text size="2" color="gray" mt="2">Mint your first one in the section above</Text>
      </Box>
    );
  }

  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
      {nfts.map((object) => {
        const display = object.data?.display?.data as {
          image_url: string;
          name: string;
        };
        
        return (
          <Card key={object.data?.objectId} style={{ overflow: 'hidden' }}>
            <Box style={{ 
              height: '200px', 
              overflow: 'hidden', 
              position: 'relative',
              backgroundColor: '#111' 
            }}>
              <img
                src={display.image_url}
                alt={display.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
            <Box p="3">
              <Heading size="4" mb="1">{display.name}</Heading>
              <Flex align="center" gap="1">
                <Box style={{ 
                  backgroundColor: '#10b981', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%' 
                }} />
                <Link
                  href={`https://devnet.suivision.xyz/object/${object.data!.objectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="1"
                  color="gray"
                >
                  {formatAddress(object.data!.objectId)}
                </Link>
              </Flex>
            </Box>
          </Card>
        );
      })}
    </Grid>
  );
}
