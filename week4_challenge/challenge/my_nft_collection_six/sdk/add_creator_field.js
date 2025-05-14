// Script to add "creator" field to the Display object

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

// Configuration
const NETWORK = 'devnet'; // or 'testnet', 'mainnet'
const RPC_URL = getFullnodeUrl(NETWORK);
const client = new SuiClient({ url: RPC_URL });

// Replace these values with your own
const PRIVATE_KEY = ''; // Your private key in base64 format
const PACKAGE_ID = ''; // Package ID from the published package
const DISPLAY_ID = ''; // Display object ID
const CREATOR_ADDRESS = ''; // The creator's address

async function addCreatorField() {
  try {
    // Create a keypair from the private key
    const keypair = Ed25519Keypair.fromSecretKey(fromB64(PRIVATE_KEY));

    // Create a transaction block
    const tx = new TransactionBlock();

    // Create an entry to add the "creator" field to the Display
    tx.moveCall({
      target: `${PACKAGE_ID}::display::add_field`,
      arguments: [
        tx.object(DISPLAY_ID),
        tx.pure("creator"),
        tx.pure(CREATOR_ADDRESS),
      ],
    });

    // Run the transaction
    const { objectChanges, balance } = await client.executeTransactionBlock({
      transactionBlock: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log('Transaction successful!');
    console.log('Object changes:', objectChanges);
    console.log('New balance:', balance);
    
    // Check that the display was updated
    const displayObj = await client.getObject({
      id: DISPLAY_ID,
      options: { showContent: true },
    });
    
    console.log('Updated Display object:', displayObj);
    
  } catch (error) {
    console.error('Error adding creator field:', error);
  }
}

// Run the function
addCreatorField(); 