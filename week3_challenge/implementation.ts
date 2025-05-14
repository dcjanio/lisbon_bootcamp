import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { execSync } from 'child_process';
import fs from 'fs';
import { PACKAGE_ID, COIN_MANAGER_ID } from './solution/ids';

// Constants and module paths
const MINT_AND_SEND = 'six::six::swap_sui_for_six';
const STAKE_SIX = 'six::six::stake';
const UNSTAKE = 'six::six::unstake';

// Initialize the Sui client
const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// Get the active keypair for signing transactions
async function getKeypair(): Promise<Ed25519Keypair> {
    // Extract key file path from config
    const configOutput = execSync('sui client active-address', { encoding: 'utf-8' });
    const activeAddress = configOutput.trim();
    
    // Read keypair from file
    const keysOutput = execSync('sui keytool list', { encoding: 'utf-8' });
    const keyMatch = keysOutput.match(new RegExp(`(\\w+)\\s+${activeAddress}\\s+ed25519`));
    
    if (!keyMatch) {
        throw new Error('Could not find keypair for active address');
    }
    
    const keyName = keyMatch[1];
    const exportOutput = execSync(`sui keytool export ${keyName} --json`, { encoding: 'utf-8' });
    const keyData = JSON.parse(exportOutput);
    
    return Ed25519Keypair.fromSecretKey(Uint8Array.from(keyData));
}

// Get the active address
async function getActiveAddress(): Promise<string> {
    const result = execSync('sui client active-address', { encoding: 'utf-8' });
    return result.trim();
}

// Request SUI from faucet
async function requestSuiFromFaucet(): Promise<void> {
    console.log('Requesting SUI from faucet...');
    execSync('sui client faucet', { stdio: 'inherit' });
}

// Get coins with retry logic for eventual consistency
async function getCoinsWithRetry(
    client: SuiClient,
    owner: string,
    coinType: string = '0x2::sui::SUI'
): Promise<any[]> {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
        const coins = await client.getCoins({
            owner,
            coinType
        });
        
        if (coins?.data?.length > 0) {
            return coins.data;
        }
        
        console.log(`No coins found on attempt ${attempts + 1}, retrying...`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Failed to get coins after ${maxAttempts} attempts`);
}

// Get the first SUI coin ID
export async function getFirstSuiCoinId(): Promise<string> {
    const activeAddress = await getActiveAddress();
    const coins = await getCoinsWithRetry(client, activeAddress);
    
    if (coins.length === 0) {
        console.log('No SUI coins found, requesting from faucet...');
        await requestSuiFromFaucet();
        return getFirstSuiCoinId(); // Retry after faucet request
    }
    
    console.log(`Found SUI coin with ID: ${coins[0].coinObjectId}`);
    return coins[0].coinObjectId;
}

// Function 1: Mint SIX tokens and stake them
export async function mintAndSendSIX(
    suiCoinId: string
): Promise<string> {
    console.log('Minting SIX tokens...');
    const keypair = await getKeypair();
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${PACKAGE_ID}::${MINT_AND_SEND}`,
        arguments: [tx.object(suiCoinId)],
    });

    console.log('Executing mint transaction...');
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true }
    });

    console.log('Transaction digest:', result.digest);
    if (!result.effects?.created || result.effects.created.length === 0) {
        throw new Error('No SIX coin was created');
    }

    const sixCoin = result.effects.created.find(
        (obj: any) => obj.owner === keypair.getPublicKey().toSuiAddress()
    );

    if (!sixCoin) {
        throw new Error('Could not find created SIX coin');
    }

    console.log('Created SIX coin with ID:', sixCoin.reference.objectId);
    return sixCoin.reference.objectId;
}

// Function 2: Stake SIX tokens
export async function stakeSIX(
    coinId: string
): Promise<string> {
    console.log('Staking SIX tokens...');
    const keypair = await getKeypair();
    const tx = new Transaction();

    tx.moveCall({
        target: `${PACKAGE_ID}::${STAKE_SIX}`,
        arguments: [tx.object(coinId)],
    });

    console.log('Executing stake transaction...');
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true }
    });

    console.log('Transaction digest:', result.digest);
    if (!result.effects?.created || result.effects.created.length === 0) {
        throw new Error('No StakedSix was created');
    }

    const stakedCoin = result.effects.created.find(
        (obj: any) => obj.owner === keypair.getPublicKey().toSuiAddress()
    );

    if (!stakedCoin) {
        throw new Error('Could not find created StakedSix');
    }

    console.log('Created StakedSix with ID:', stakedCoin.reference.objectId);
    return stakedCoin.reference.objectId;
}

// Function 3: Combined mint and stake in one PTB
export async function mintAndStakeInOnePTB(
    suiCoinId: string
): Promise<{ sixCoinId: string; stakedCoinId: string }> {
    console.log('Minting and staking SIX tokens in one transaction...');
    const keypair = await getKeypair();
    const tx = new Transaction();
    
    // First, mint the SIX token
    const [sixCoin] = tx.moveCall({
        target: `${PACKAGE_ID}::${MINT_AND_SEND}`,
        arguments: [tx.object(suiCoinId)],
    });

    // Then stake it in the same transaction
    tx.moveCall({
        target: `${PACKAGE_ID}::${STAKE_SIX}`,
        arguments: [sixCoin],
    });

    console.log('Executing mint and stake transaction...');
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true }
    });

    console.log('Transaction digest:', result.digest);
    
    // Extract the created objects
    if (!result.effects?.created || result.effects.created.length === 0) {
        throw new Error('No objects were created');
    }
    
    // Find the StakedSix object
    const stakedCoin = result.effects.created.find(
        (obj: any) => obj.owner === keypair.getPublicKey().toSuiAddress()
    );
    
    if (!stakedCoin) {
        throw new Error('Could not find created StakedSix');
    }
    
    // Since we're doing both operations in one PTB, the SIX coin is transferred internally
    // and won't appear in the created objects. So we'll return a placeholder for sixCoinId
    return {
        sixCoinId: "SIX coin is directly staked in this transaction",
        stakedCoinId: stakedCoin.reference.objectId
    };
}

// Function 4: Split a coin into 4 equal parts
export async function splitCoinIntoFour(
    suiCoinId: string
): Promise<{ newCoinIds: string[], totalStorageRebate: bigint }> {
    console.log('Splitting coin into four equal parts...');
    const keypair = await getKeypair();
    
    // First, get the coin details to determine amount
    const coinObject = await client.getObject({
        id: suiCoinId,
        options: { showContent: true }
    });
    
    if (!coinObject.data || !coinObject.data.content) {
        throw new Error('Could not get coin details');
    }
    
    const content = coinObject.data.content as any;
    const balance = BigInt(content.fields.balance);
    const amountPerCoin = balance / BigInt(5); // Divide by 5 to keep some gas for tx and create 4 equal coins
    
    // Create a transaction to split the coin
    const tx = new Transaction();
    const splitCoins = tx.splitCoins(tx.object(suiCoinId), [
        amountPerCoin,
        amountPerCoin,
        amountPerCoin,
        amountPerCoin
    ]);
    
    // Execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true, showEvents: true }
    });
    
    console.log('Transaction digest:', result.digest);
    
    // Extract the created coins
    if (!result.effects?.created || result.effects.created.length < 4) {
        throw new Error('Not enough coins were created');
    }
    
    // Extract the IDs of the newly created coins
    const newCoinIds = result.effects.created
        .filter((obj: any) => obj.owner === keypair.getPublicKey().toSuiAddress())
        .map((obj: any) => obj.reference.objectId);
    
    console.log('Created coin IDs:', newCoinIds);
    
    // Calculate total storage rebate
    let totalStorageRebate = BigInt(0);
    
    // Get transaction details to extract storage rebate
    const txDetails = await client.getTransactionBlock({
        digest: result.digest,
        options: { showEffects: true, showEvents: true, showInput: true, showObjectChanges: true }
    });
    
    if (txDetails.effects?.gasUsed) {
        totalStorageRebate = BigInt(txDetails.effects.gasUsed.storageRebate);
    }
    
    console.log('Total storage rebate:', totalStorageRebate.toString());
    
    return {
        newCoinIds,
        totalStorageRebate
    };
}

// Function 5: Merge coins
export async function mergeCoins(
    primaryCoinId: string,
    coinIdsToMerge: string[]
): Promise<{ gasPaid: bigint }> {
    console.log('Merging coins...');
    const keypair = await getKeypair();
    
    // Create a transaction to merge the coins
    const tx = new Transaction();
    const primaryCoin = tx.object(primaryCoinId);
    
    // Merge each coin into the primary coin
    for (const coinId of coinIdsToMerge) {
        tx.mergeCoins(primaryCoin, tx.object(coinId));
    }
    
    // Execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true }
    });
    
    console.log('Transaction digest:', result.digest);
    
    // Calculate gas paid
    let gasPaid = BigInt(0);
    if (result.effects?.gasUsed) {
        const computationCost = BigInt(result.effects.gasUsed.computationCost);
        const storageCost = BigInt(result.effects.gasUsed.storageCost);
        const storageRebate = BigInt(result.effects.gasUsed.storageRebate);
        
        gasPaid = computationCost + storageCost - storageRebate;
    }
    
    console.log('Gas paid:', gasPaid.toString());
    
    return { gasPaid };
}

// Function 6: Exchange SUI for SIX, unstake and get rewards
export async function exchangeAndUnstake(
    stakedSixId: string,
    suiCoinId: string
): Promise<{ rewardAmount: bigint }> {
    console.log('Exchanging SUI for SIX and unstaking...');
    const keypair = await getKeypair();
    const tx = new Transaction();
    
    // First, swap SUI for SIX
    tx.moveCall({
        target: `${PACKAGE_ID}::${MINT_AND_SEND}`,
        arguments: [tx.object(suiCoinId)],
    });
    
    // Then unstake the previously staked SIX
    tx.moveCall({
        target: `${PACKAGE_ID}::${UNSTAKE}`,
        arguments: [tx.object(stakedSixId)],
    });
    
    // Execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: { showEffects: true, showEvents: true }
    });
    
    console.log('Transaction digest:', result.digest);
    
    // Calculate rewards by examining transaction details
    // This is a simplified approach - in a real implementation, you would 
    // need to analyze the transaction events to find the exact reward amount
    const txDetails = await client.getTransactionBlock({
        digest: result.digest,
        options: { showEffects: true, showEvents: true }
    });
    
    // For this example, we'll assume the reward is the amount of SUI added to the user's balance
    // In a real implementation, you'd need to parse events to find the actual reward amount
    let rewardAmount = BigInt(0);
    
    // Placeholder for reward calculation logic
    // In reality, this would involve analyzing transaction events
    if (txDetails.events && txDetails.events.length > 0) {
        // Process events to find the reward amount
        // This is simplified - you'd need to filter events for the actual reward
        for (const event of txDetails.events) {
            // Look for events related to rewards
            if (event.type.includes('unstake') || event.type.includes('reward')) {
                // Extract reward amount from event
                // This is pseudo-code - the actual implementation depends on your contract's events
                if (event.parsedJson && event.parsedJson.rewardAmount) {
                    rewardAmount = BigInt(event.parsedJson.rewardAmount);
                    break;
                }
            }
        }
    }
    
    console.log('Reward amount:', rewardAmount.toString());
    
    return { rewardAmount };
}

// Main function to demonstrate all operations
export async function runChallenge(): Promise<void> {
    try {
        // Step 1: Get a SUI coin
        const suiCoinId = await getFirstSuiCoinId();
        console.log(`Using SUI coin: ${suiCoinId}`);
        
        // Step 2: Mint SIX tokens
        const sixCoinId = await mintAndSendSIX(suiCoinId);
        console.log(`Minted SIX coin: ${sixCoinId}`);
        
        // Step 3: Stake SIX tokens
        const stakedSixId = await stakeSIX(sixCoinId);
        console.log(`Staked SIX coin: ${stakedSixId}`);
        
        // Step 4: Mint and stake in one transaction
        const combinedResult = await mintAndStakeInOnePTB(suiCoinId);
        console.log(`Combined mint and stake: ${JSON.stringify(combinedResult)}`);
        
        // Step 5: Split a coin into 4 equal parts
        const splitResult = await splitCoinIntoFour(suiCoinId);
        console.log(`Split coin result: ${JSON.stringify(splitResult)}`);
        
        // Step 6: Merge the coins
        const mergeResult = await mergeCoins(suiCoinId, splitResult.newCoinIds);
        console.log(`Merge coins result: ${JSON.stringify(mergeResult)}`);
        
        // Step 7: Exchange and unstake
        const exchangeResult = await exchangeAndUnstake(stakedSixId, suiCoinId);
        console.log(`Exchange and unstake result: ${JSON.stringify(exchangeResult)}`);
        
        console.log('Challenge complete!');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the challenge if this file is executed directly
if (require.main === module) {
    runChallenge().catch(console.error);
} 