import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import {
  getKeypair,
  getFirstSuiCoinId,
  mintAndSendSIX,
  splitCoinIntoFour,
  mergeCoins,
  stakeSIX,
  unstakeAndGetRewards,
  exchangeAndUnstake,
  COIN_TYPE,
  getActiveAddress
} from './solution';
import { PACKAGE_ID, COIN_MANAGER_ID } from './ids';

async function runTests() {
  try {
    // Initialize client
    const client = new SuiClient({ url: getFullnodeUrl('devnet') });
    
    // Get active address
    const address = await getActiveAddress();
    console.log('Using address:', address);
    
    // Test 1: Get first SUI coin ID
    console.log('\nTest 1: Getting first SUI coin ID...');
    const suiCoinId = await getFirstSuiCoinId(client, address);
    console.log('Got SUI coin ID:', suiCoinId);

    // Test 2: Mint and send SIX
    console.log('\nTest 2: Minting and sending SIX...');
    const sixCoinId = await mintAndSendSIX(client, address, 100000000, PACKAGE_ID, COIN_MANAGER_ID);
    console.log('Successfully minted and sent SIX. Coin ID:', sixCoinId);

    // Test 3: Split coin into four
    console.log('\nTest 3: Splitting coin into four...');
    const splitCoinIds = await splitCoinIntoFour(client, sixCoinId);
    console.log('Split coin IDs:', splitCoinIds);

    // Test 4: Merge coins
    console.log('\nTest 4: Merging coins...');
    const mergedCoinId = await mergeCoins(client, splitCoinIds);
    console.log('Merged coin ID:', mergedCoinId);

    // Test 5: Stake SIX
    console.log('\nTest 5: Staking SIX...');
    const stakedCoinId = await stakeSIX(client, mergedCoinId);
    console.log('Staked coin ID:', stakedCoinId);

    // Test 6: Unstake and get rewards
    console.log('\nTest 6: Unstaking and getting rewards...');
    const unstakedCoinId = await unstakeAndGetRewards(client, stakedCoinId);
    console.log('Unstaked coin ID:', unstakedCoinId);

    // Test 7: Mint another SIX token for the exchange and unstake test
    console.log('\nTest 7: Minting another SIX token...');
    const newSixCoinId = await mintAndSendSIX(client, address, 100000000, PACKAGE_ID, COIN_MANAGER_ID);
    console.log('New SIX coin ID:', newSixCoinId);
    
    // Test 8: Stake the new SIX token
    console.log('\nTest 8: Staking the new SIX token...');
    const newStakedCoinId = await stakeSIX(client, newSixCoinId);
    console.log('New staked SIX coin ID:', newStakedCoinId);
    
    // Test 9: Exchange and unstake
    console.log('\nTest 9: Exchanging and unstaking...');
    const exchangeResult = await exchangeAndUnstake(client, newStakedCoinId);
    console.log('Exchange result:', exchangeResult);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests(); 