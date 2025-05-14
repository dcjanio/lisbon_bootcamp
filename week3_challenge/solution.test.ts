import { getFirstSUICoinId, mintAndSendSIX, splitCoinIntoFour, mergeCoins, stakeSIX, exchangeAndUnstake } from './solution';
import { execSync } from 'child_process';

describe('SUI Coin Operations', () => {
    const ACTIVE_ADDRESS = execSync('sui client active-address').toString().trim();

    test('should get first SUI coin ID', async () => {
        const coinId = await getFirstSUICoinId(ACTIVE_ADDRESS);
        console.log('First SUI coin ID:', coinId);
        expect(coinId).toBeDefined();
    });

    test('should mint and send SIX coins', async () => {
        const result = await mintAndSendSIX(1000);
        console.log('Mint and send result:', result);
        expect(result).toBeDefined();
    });

    test('should split coin into four parts', async () => {
        const coinId = await getFirstSUICoinId(ACTIVE_ADDRESS);
        if (!coinId) {
            throw new Error('No SUI coin found');
        }
        const result = await splitCoinIntoFour(coinId);
        console.log('Split result:', result);
        expect(result).toBeDefined();
    });

    test('should merge coins', async () => {
        const coinId = await getFirstSUICoinId(ACTIVE_ADDRESS);
        if (!coinId) {
            throw new Error('No SUI coin found');
        }
        const result = await mergeCoins([coinId]);
        console.log('Merge result:', result);
        expect(result).toBeDefined();
    });

    test('should stake SIX coins', async () => {
        const result = await mintAndSendSIX(1000);
        console.log('Mint result:', result);
        
        // Get the created coin ID from the result
        const createdObjects = result.effects?.created || [];
        const coinId = createdObjects[0]?.reference?.objectId;
        
        if (!coinId) {
            throw new Error('Failed to get coin ID from mint transaction');
        }
        
        const stakeResult = await stakeSIX(coinId);
        console.log('Stake result:', stakeResult);
        expect(stakeResult).toBeDefined();
    });

    test('should exchange and unstake', async () => {
        const result = await exchangeAndUnstake(1000);
        console.log('Exchange and unstake result:', result);
        expect(result).toBeDefined();
    });
}); 