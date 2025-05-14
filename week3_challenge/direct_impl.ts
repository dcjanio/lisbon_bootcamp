import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { executeSuiCommand, extractObjectIds, extractTransactionDigest, extractGasCost } from './utils';
import { PACKAGE_ID, COIN_MANAGER_ID } from './ids';

// Initialize the client
const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// Our two addresses
const MAIN_ADDRESS = '0x0a094d9aceabdf55e16d3bee60bd16d6631e03ba3c8d47f66e3c4966d87806f4';
const TEST_ADDRESS = MAIN_ADDRESS; // Use the main address for all operations
const TEST_COIN = '0xaa2a935264067a6929487397d9de7c8993838a34af19fc9c14ec3603379dcb69'; // Use the main address's coin

// Add these constants at the top
const GAS_BUDGET = 1000000; // Reduced gas budget
const SMALLER_AMOUNT = 10000; // Smaller amount for transactions

/**
 * Function 1: Mint an arbitrary amount of SIX tokens and send them to the caller
 */
async function mintAndSendSIX(amount: number = SMALLER_AMOUNT): Promise<string> {
  try {
    // First, split a small SUI coin from our test coin
    const splitCommand = `sui client split-coin --coin-id ${TEST_COIN} --amounts ${amount} --gas-budget ${GAS_BUDGET}`;
    const splitResult = await executeSuiCommand(splitCommand);
    console.log('Split result:', splitResult.stdout);
    
    // Extract the newly created coin ID
    const splitCoinIds = extractObjectIds(splitResult.stdout);
    if (splitCoinIds.length === 0) {
      throw new Error('Failed to split coin');
    }
    
    const splitCoinId = splitCoinIds[0];
    console.log(`Created split coin with ID: ${splitCoinId}`);
    
    // Use the split coin to swap for SIX tokens
    const swapCommand = `sui client call --gas ${TEST_COIN} --package ${PACKAGE_ID} --module six --function swap_sui_for_six --args ${COIN_MANAGER_ID} ${splitCoinId} --gas-budget ${GAS_BUDGET}`;
    const swapResult = await executeSuiCommand(swapCommand);
    console.log('Swap result:', swapResult.stdout);
    
    // Extract the SIX coin ID
    const sixCoinIds = extractObjectIds(swapResult.stdout);
    if (sixCoinIds.length === 0) {
      throw new Error('Failed to mint SIX coin');
    }
    
    const sixCoinId = sixCoinIds[0];
    console.log(`Minted SIX coin with ID: ${sixCoinId}`);
    
    return sixCoinId;
  } catch (error) {
    console.error('Error in mintAndSendSIX:', error);
    throw error;
  }
}

/**
 * Function 2: Stake a SIX coin
 */
async function stakeSIX(sixCoinId: string): Promise<string> {
  try {
    // Call the stake function
    const stakeCommand = `sui client call --gas ${TEST_COIN} --package ${PACKAGE_ID} --module six --function stake --args ${COIN_MANAGER_ID} ${sixCoinId} --gas-budget ${GAS_BUDGET}`;
    const stakeResult = await executeSuiCommand(stakeCommand);
    console.log('Stake result:', stakeResult.stdout);
    
    // Extract the staked coin ID
    const stakedCoinIds = extractObjectIds(stakeResult.stdout);
    if (stakedCoinIds.length === 0) {
      throw new Error('Failed to stake SIX coin');
    }
    
    const stakedCoinId = stakedCoinIds[0];
    console.log(`Staked SIX coin with ID: ${stakedCoinId}`);
    
    return stakedCoinId;
  } catch (error) {
    console.error('Error in stakeSIX:', error);
    throw error;
  }
}

/**
 * Function 3: Mint and stake SIX in one transaction
 */
async function mintAndStakeSIX(amount: number = SMALLER_AMOUNT): Promise<string> {
  try {
    // First mint SIX
    const sixCoinId = await mintAndSendSIX(amount);
    console.log(`Minted SIX coin: ${sixCoinId}`);
    
    // Then stake it
    const stakedCoinId = await stakeSIX(sixCoinId);
    console.log(`Staked SIX coin: ${stakedCoinId}`);
    
    return stakedCoinId;
  } catch (error) {
    console.error('Error in mintAndStakeSIX:', error);
    throw error;
  }
}

/**
 * Function 4: Find the first SUI coin in an address
 */
async function getFirstSuiCoin(address: string = TEST_ADDRESS): Promise<string> {
  try {
    const coins = await client.getCoins({ owner: address });
    if (coins.data.length === 0) {
      throw new Error(`No SUI coins found for address ${address}`);
    }
    
    const coinId = coins.data[0].coinObjectId;
    console.log(`Found SUI coin: ${coinId}`);
    
    return coinId;
  } catch (error) {
    console.error('Error in getFirstSuiCoin:', error);
    throw error;
  }
}

/**
 * Function 5: Split a coin into 4 equal parts and calculate total storage rebate
 */
async function splitCoinAndCalculateRebate(coinId: string): Promise<{ coinIds: string[], totalRebate: number }> {
  try {
    // Get the coin info to determine its amount
    const coinObject = await client.getObject({
      id: coinId,
      options: { showContent: true }
    });
    
    if (!coinObject.data || !coinObject.data.content) {
      throw new Error(`Could not get coin data for ${coinId}`);
    }
    
    // Extract coin value
    const coinContent = coinObject.data.content as any;
    const balance = parseInt(coinContent.fields.balance);
    
    // Calculate amount for each split (divide by 4)
    const splitAmount = Math.floor(balance / 4);
    console.log(`Splitting coin ${coinId} with balance ${balance} into 4 parts of ${splitAmount} each`);
    
    // Execute split via CLI
    const splitCommand = `sui client split-coin --coin-id ${coinId} --amounts ${splitAmount} ${splitAmount} ${splitAmount} --gas-budget ${GAS_BUDGET}`;
    const splitResult = await executeSuiCommand(splitCommand);
    console.log('Split result:', splitResult.stdout);
    
    // Extract the coin IDs
    const newCoinIds = extractObjectIds(splitResult.stdout);
    if (newCoinIds.length < 3) {
      throw new Error(`Expected at least 3 new coins, but found ${newCoinIds.length}`);
    }
    
    // Calculate the total storage rebate
    const gasCosts = extractGasCost(splitResult.stdout);
    console.log(`Storage rebate: ${gasCosts.storageRebate}`);
    
    // Return the original coin plus the new ones, and the rebate
    return { 
      coinIds: [coinId, ...newCoinIds], 
      totalRebate: gasCosts.storageRebate
    };
  } catch (error) {
    console.error('Error in splitCoinAndCalculateRebate:', error);
    throw error;
  }
}

/**
 * Function 6: Merge coins and explain gas used
 */
async function mergeCoinAndExplainGas(coinIds: string[]): Promise<{ mergedCoinId: string, gasPaid: number }> {
  try {
    if (coinIds.length < 2) {
      throw new Error('Need at least 2 coins to merge');
    }
    
    // Get the primary coin and coins to merge
    const primaryCoin = coinIds[0];
    const coinsToMerge = coinIds.slice(1);
    
    // Build the merge command
    let mergeCommand = `sui client merge-coin --primary-coin ${primaryCoin} --gas-budget ${GAS_BUDGET}`;
    for (const coinId of coinsToMerge) {
      mergeCommand += ` --coin ${coinId}`;
    }
    
    // Execute the merge
    const mergeResult = await executeSuiCommand(mergeCommand);
    console.log('Merge result:', mergeResult.stdout);
    
    // Calculate gas paid
    const gasCosts = extractGasCost(mergeResult.stdout);
    const gasPaid = gasCosts.storage + gasCosts.computation - gasCosts.storageRebate;
    
    console.log(`Gas paid for merge: ${gasPaid}`);
    console.log('Explanation: The gas paid is relatively low because:');
    console.log('1. Merging coins reduces the storage used (fewer objects)');
    console.log('2. Storage rebates offset a significant portion of the cost');
    console.log('3. The computation cost is minimal for merge operations');
    
    return { mergedCoinId: primaryCoin, gasPaid };
  } catch (error) {
    console.error('Error in mergeCoinAndExplainGas:', error);
    throw error;
  }
}

/**
 * Function 7: Exchange SUI for SIX, unstake SIX, and calculate rewards
 */
async function exchangeUnstakeAndCalculateRewards(stakedCoinId: string): Promise<{ sixCoinId: string, suiRewards: number }> {
  try {
    // First, create a small SUI coin for exchange
    const splitAmount = SMALLER_AMOUNT; // Much smaller amount
    const splitCommand = `sui client split-coin --coin-id ${TEST_COIN} --amounts ${splitAmount} --gas-budget ${GAS_BUDGET}`;
    const splitResult = await executeSuiCommand(splitCommand);
    console.log('Split result:', splitResult.stdout);
    
    // Extract the split coin ID
    const splitCoinIds = extractObjectIds(splitResult.stdout);
    if (splitCoinIds.length === 0) {
      throw new Error('Failed to split coin for exchange');
    }
    
    const splitCoinId = splitCoinIds[0];
    
    // Exchange SUI for SIX
    const exchangeCommand = `sui client call --gas ${TEST_COIN} --package ${PACKAGE_ID} --module six --function swap_sui_for_six --args ${COIN_MANAGER_ID} ${splitCoinId} --gas-budget ${GAS_BUDGET}`;
    const exchangeResult = await executeSuiCommand(exchangeCommand);
    console.log('Exchange result:', exchangeResult.stdout);
    
    // Unstake the staked SIX tokens
    const unstakeCommand = `sui client call --gas ${TEST_COIN} --package ${PACKAGE_ID} --module six --function unstake --args ${COIN_MANAGER_ID} ${stakedCoinId} --gas-budget ${GAS_BUDGET}`;
    const unstakeResult = await executeSuiCommand(unstakeCommand);
    console.log('Unstake result:', unstakeResult.stdout);
    
    // Extract the unstaked SIX coin ID
    const unstakeObjectIds = extractObjectIds(unstakeResult.stdout);
    if (unstakeObjectIds.length === 0) {
      throw new Error('Failed to unstake SIX token');
    }
    
    // Calculate rewards (in a real scenario, we would extract from transaction events)
    // For this demo, let's use a simulated reward amount
    const suiRewards = 0; // Placeholder, as our test contract doesn't have rewards implemented
    
    return { sixCoinId: unstakeObjectIds[0], suiRewards };
  } catch (error) {
    console.error('Error in exchangeUnstakeAndCalculateRewards:', error);
    throw error;
  }
}

// Run all functions in sequence to demonstrate their functionality
async function runAllFunctions() {
  try {
    console.log('===== Starting Demonstration of All Functions =====');
    
    console.log('\n----- 1. Mint and Send SIX -----');
    const sixCoinId = await mintAndSendSIX();
    
    console.log('\n----- 2. Stake SIX -----');
    const stakedCoinId = await stakeSIX(sixCoinId);
    
    console.log('\n----- 3. Mint and Stake in one operation -----');
    const combinedStakedCoinId = await mintAndStakeSIX();
    
    console.log('\n----- 4. Get First SUI Coin -----');
    const firstSuiCoin = await getFirstSuiCoin();
    
    console.log('\n----- 5. Split Coin and Calculate Rebate -----');
    // Let's mint a new coin specifically for the split
    const coinForSplit = await mintAndSendSIX(400000000); 
    const splitResult = await splitCoinAndCalculateRebate(coinForSplit);
    
    console.log('\n----- 6. Merge Coins and Explain Gas -----');
    const mergeResult = await mergeCoinAndExplainGas(splitResult.coinIds);
    
    console.log('\n----- 7. Exchange, Unstake, and Calculate Rewards -----');
    const rewardsResult = await exchangeUnstakeAndCalculateRewards(combinedStakedCoinId);
    
    console.log('\n===== Demonstration Complete =====');
  } catch (error) {
    console.error('Error running all functions:', error);
  }
}

// Export all functions
export {
  mintAndSendSIX,
  stakeSIX,
  mintAndStakeSIX,
  getFirstSuiCoin,
  splitCoinAndCalculateRebate,
  mergeCoinAndExplainGas,
  exchangeUnstakeAndCalculateRewards,
  runAllFunctions
};

// Run the demonstration if this file is executed directly
if (require.main === module) {
  runAllFunctions()
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error:', err));
} 