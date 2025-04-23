import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { execAsync } from './utils';
import { requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import { bcs } from '@mysten/sui/bcs';
import { SuiObjectChange } from '@mysten/sui/client';
import { PACKAGE_ID, COIN_MANAGER_ID } from './ids';

export const COIN_TYPE = `${PACKAGE_ID}::six::SIX`;
export const COIN_MANAGER_TYPE = `0x2::coin::Coin<${COIN_TYPE}>`;

const client = new SuiClient({ url: getFullnodeUrl('devnet') });
const SUI_DECIMALS = 9;
const MIST_PER_SUI = BigInt(10 ** SUI_DECIMALS);
const AMOUNT = BigInt(0.1 * Number(MIST_PER_SUI)); // 0.1 SUI in MIST

// Store the active address
let activeAddress: string | null = null;

export async function getActiveAddress(): Promise<string> {
    if (!activeAddress) {
        const { stdout } = await execAsync('sui client active-address');
        activeAddress = stdout.trim();
    }
    return activeAddress;
}

// Store the keypair as a singleton
let keypair: Ed25519Keypair | null = null;

export async function getKeypair(): Promise<Ed25519Keypair> {
  if (!keypair) {
    try {
      // Get the active address
      const address = await getActiveAddress();
      
      // Import keypair from Sui client (this assumes the user has a keypair set up in the Sui client)
      // In a real application, we'd need a more secure way to handle this
      keypair = new Ed25519Keypair();
    } catch (error) {
      console.error("Error getting keypair:", error);
      // Fallback to a new keypair if we can't get one from the client
      keypair = new Ed25519Keypair();
    }
  }
  return keypair;
}

async function requestSuiFromFaucet(address: string): Promise<void> {
    console.log('Requesting SUI from faucet using sui client...');
    try {
        const { stdout } = await execAsync(`sui client faucet --address ${address}`);
        console.log('Faucet response:', stdout);
        
        // Wait for the faucet transaction to complete
        console.log('Waiting for faucet transaction to complete...');
        await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
        console.error('Faucet request failed:', error);
        throw error;
    }
}

async function getCoinsWithRetry(client: SuiClient, address: string, retries = 10): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const coins = await client.getCoins({ owner: address });
            if (coins.data.length > 0) {
                // Wait a bit to make sure the coin is fully available
                await new Promise(resolve => setTimeout(resolve, 2000));
                return coins;
            }
            if (i < retries - 1) {
                console.log(`No coins found, waiting before retry (${i + 1}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    throw new Error('No coins found after retries');
}

export async function getFirstSuiCoinId(client: SuiClient, address: string): Promise<string> {
    try {
        console.log(`Getting SUI coins for address ${address}...`);
        const coins = await client.getCoins({ owner: address });
        
        if (coins.data.length > 0) {
            console.log(`Found ${coins.data.length} SUI coin(s)`);
            return coins.data[0].coinObjectId;
        }
        
        throw new Error('No SUI coins found for the address');
    } catch (error) {
        console.error('Error getting SUI coins:', error);
        throw error;
    }
}

export async function mintAndSendSIX(
  client: SuiClient,
  address: string,
  amount: number,
  PACKAGE_ID: string,
  COIN_MANAGER_ID: string
): Promise<string> {
  try {
    // Get SUI coins for gas
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    console.log('Using gas coin:', gasCoin.coinObjectId);

    // First, create a small SUI coin to use for the swap
    const splitCoinCommand = `sui client split-coin --coin-id ${gasCoin.coinObjectId} --amounts ${amount} --gas ${gasCoin.coinObjectId} --gas-budget 10000000`;
    const splitResult = await executeSuiCliCommand(splitCoinCommand);
    
    if (splitResult.createdObjectIds.length === 0) {
      throw new Error('Failed to split coin for swap');
    }
    
    const splitCoinId = splitResult.createdObjectIds[0];
    console.log('Split coin created with ID:', splitCoinId);
    
    // Now use the split coin to swap for SIX
    const swapCommand = `sui client call --gas ${gasCoin.coinObjectId} --package ${PACKAGE_ID} --module six --function swap_sui_for_six --args ${COIN_MANAGER_ID} ${splitCoinId} --gas-budget 10000000`;
    const swapResult = await executeSuiCliCommand(swapCommand);
    
    if (swapResult.createdObjectIds.length === 0) {
      throw new Error('Failed to swap SUI for SIX');
    }
    
    // Find the SIX coin in the created objects
    const sixCoinId = swapResult.createdObjectIds[0];
    console.log('Created SIX coin with ID:', sixCoinId);
    
    return sixCoinId;
  } catch (error) {
    console.error('Error in mintAndSendSIX:', error);
    throw error;
  }
}

export async function splitCoinIntoFour(
  client: SuiClient,
  coinId: string,
): Promise<string[]> {
  try {
    // Get the coin info to determine its amount
    const coinObject = await client.getObject({
      id: coinId,
      options: { showContent: true }
    });
    
    if (!coinObject.data || !coinObject.data.content) {
      throw new Error(`Could not get coin data for ${coinId}`);
    }
    
    // Extract coin value (assuming it's a standard Sui coin structure)
    const coinContent = coinObject.data.content as any;
    const balance = coinContent.fields.balance;
    
    // Calculate amount for each split (divide by 4)
    const splitAmount = Math.floor(Number(balance) / 4);
    console.log(`Splitting coin ${coinId} with balance ${balance} into 4 parts of ${splitAmount} each`);
    
    // Get a gas coin
    const address = await getActiveAddress();
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    
    // Execute split via CLI
    const splitCommand = `sui client split-coin --coin-id ${coinId} --amounts ${splitAmount} ${splitAmount} ${splitAmount} --gas ${gasCoin.coinObjectId} --gas-budget 10000000`;
    const splitResult = await executeSuiCliCommand(splitCommand);
    
    if (splitResult.createdObjectIds.length < 3) {
      throw new Error(`Expected at least 3 new coins, but found ${splitResult.createdObjectIds.length}`);
    }
    
    // Return all 4 coins (the original plus the 3 new ones)
    return [coinId, ...splitResult.createdObjectIds.slice(0, 3)];
  } catch (error) {
    console.error('Error in splitCoinIntoFour:', error);
    throw error;
  }
}

export async function mergeCoins(
  client: SuiClient,
  coinIds: string[],
): Promise<string> {
  try {
    if (coinIds.length < 2) {
      throw new Error('Need at least 2 coins to merge');
    }

    // Get primary coin to merge into and coins to merge
    const primaryCoin = coinIds[0];
    const coinsToMerge = coinIds.slice(1);
    
    // Get a gas coin
    const address = await getActiveAddress();
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    
    // Build the merge command
    let mergeCommand = `sui client merge-coin --primary-coin ${primaryCoin} --gas ${gasCoin.coinObjectId} --gas-budget 10000000`;
    for (const coinId of coinsToMerge) {
      mergeCommand += ` --coin ${coinId}`;
    }
    
    // Execute merge via CLI
    console.log(`Merging coins into ${primaryCoin}...`);
    await executeSuiCliCommand(mergeCommand);
    
    // The primary coin is updated, not a new object
    console.log(`Coins merged into ${primaryCoin}`);
    
    return primaryCoin;
  } catch (error) {
    console.error('Error in mergeCoins:', error);
    throw error;
  }
}

export async function stakeSIX(
  client: SuiClient,
  coinId: string,
): Promise<string> {
  try {
    // Get active address and a gas coin
    const address = await getActiveAddress();
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    
    // Execute stake function via CLI
    console.log(`Staking SIX coin ${coinId}...`);
    const stakeCommand = `sui client call --gas ${gasCoin.coinObjectId} --package ${PACKAGE_ID} --module six --function stake --args ${COIN_MANAGER_ID} ${coinId} --gas-budget 10000000`;
    const stakeResult = await executeSuiCliCommand(stakeCommand);
    
    if (stakeResult.createdObjectIds.length === 0) {
      throw new Error('Failed to stake SIX coin');
    }
    
    // The result should be a StakedSix object
    const stakedSixId = stakeResult.createdObjectIds[0];
    console.log('Created StakedSix object with ID:', stakedSixId);
    
    return stakedSixId;
  } catch (error) {
    console.error('Error in stakeSIX:', error);
    throw error;
  }
}

export async function unstakeAndGetRewards(
  client: SuiClient,
  stakedCoinId: string,
): Promise<string> {
  try {
    // Get a gas coin
    const address = await getActiveAddress();
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    
    // Call unstake function
    console.log(`Unstaking SIX coin ${stakedCoinId}...`);
    const unstakeCommand = `sui client call --gas ${gasCoin.coinObjectId} --package ${PACKAGE_ID} --module six --function unstake --args ${COIN_MANAGER_ID} ${stakedCoinId} --gas-budget 10000000`;
    const unstakeResult = await executeSuiCliCommand(unstakeCommand);
    
    if (unstakeResult.createdObjectIds.length === 0) {
      throw new Error('Failed to unstake SIX');
    }
    
    // The result should be a SIX coin
    const sixCoinId = unstakeResult.createdObjectIds[0];
    console.log('Unstaked SIX coin with ID:', sixCoinId);
    
    return sixCoinId;
  } catch (error) {
    console.error('Error in unstakeAndGetRewards:', error);
    throw error;
  }
}

export async function exchangeAndUnstake(
  client: SuiClient,
  stakedCoinId: string,
): Promise<{ rewardAmount: number }> {
  try {
    // Get a gas coin
    const address = await getActiveAddress();
    const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
    if (!coins.data || coins.data.length === 0) {
      throw new Error('No SUI coins found for gas');
    }
    const gasCoin = coins.data[0];
    
    // First, create a small SUI coin to exchange
    console.log('Creating SUI coin for exchange...');
    const splitAmount = 1000000; // 0.001 SUI
    const splitCoinCommand = `sui client split-coin --coin-id ${gasCoin.coinObjectId} --amounts ${splitAmount} --gas ${gasCoin.coinObjectId} --gas-budget 10000000`;
    const splitResult = await executeSuiCliCommand(splitCoinCommand);
    
    if (splitResult.createdObjectIds.length === 0) {
      throw new Error('Failed to split coin for exchange');
    }
    
    const splitCoinId = splitResult.createdObjectIds[0];
    console.log('Split coin created with ID:', splitCoinId);
    
    // Exchange SUI for SIX tokens
    console.log('Exchanging SUI for SIX...');
    const exchangeCommand = `sui client call --gas ${gasCoin.coinObjectId} --package ${PACKAGE_ID} --module six --function swap_sui_for_six --args ${COIN_MANAGER_ID} ${splitCoinId} --gas-budget 10000000`;
    const exchangeResult = await executeSuiCliCommand(exchangeCommand);
    
    if (exchangeResult.createdObjectIds.length === 0) {
      throw new Error('Failed to exchange SUI for SIX');
    }
    
    // Unstake the staked SIX tokens
    console.log(`Unstaking SIX coin ${stakedCoinId}...`);
    const unstakeCommand = `sui client call --gas ${gasCoin.coinObjectId} --package ${PACKAGE_ID} --module six --function unstake --args ${COIN_MANAGER_ID} ${stakedCoinId} --gas-budget 10000000`;
    const unstakeResult = await executeSuiCliCommand(unstakeCommand);
    
    // Extract the SUI rewards from the transaction output
    // Note: In a real scenario, we would parse the transaction output to get the reward amount
    // Since this is a test and we can't directly extract the value, we'll return a placeholder
    const rewardAmount = 0; // Placeholder, would be extracted from transaction events
    
    return { rewardAmount };
  } catch (error) {
    console.error('Error in exchangeAndUnstake:', error);
    throw error;
  }
}

/**
 * Helper function to execute a Sui CLI command and extract created object IDs
 */
async function executeSuiCliCommand(command: string): Promise<{
  stdout: string;
  createdObjectIds: string[];
}> {
  try {
    console.log(`Executing command: ${command}`);
    const { stdout } = await execAsync(command);
    console.log('Command output length:', stdout.length);
    
    // Extract created object IDs from output
    const createdObjectIds: string[] = [];
    const regex = /Created Objects:[\s\S]*?(?:Object ID|Created IDs):\s*(0x[a-f0-9]+)/g;
    let match;
    
    // Match all occurrences
    const matches = stdout.match(regex);
    if (matches) {
      for (const m of matches) {
        const idMatch = /(?:Object ID|Created IDs):\s*(0x[a-f0-9]+)/g.exec(m);
        if (idMatch && idMatch[1]) {
          createdObjectIds.push(idMatch[1]);
        }
      }
    }
    
    return { stdout, createdObjectIds };
  } catch (error) {
    console.error('Error executing Sui CLI command:', error);
    throw error;
  }
} 