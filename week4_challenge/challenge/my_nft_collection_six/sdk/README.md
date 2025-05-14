# SDK for SIX NFT Collection

This directory contains SDK scripts for interacting with the SIX NFT Collection.

## Add Creator Field Script

The `add_creator_field.js` script adds the "creator" field to the Display object of the NFT collection. This is necessary because Move doesn't directly support adding the "creator" field during initialization.

### Prerequisites

1. Node.js 16 or later
2. The following npm packages:
   - `@mysten/sui.js` (Sui JavaScript SDK)

### Setup

1. Install dependencies:
   ```bash
   npm install @mysten/sui.js
   ```

2. Configure the script by updating the following variables in `add_creator_field.js`:
   - `PRIVATE_KEY`: Your private key in base64 format
   - `PACKAGE_ID`: The ID of the published package
   - `DISPLAY_ID`: The ID of the Display object
   - `CREATOR_ADDRESS`: The address to be set as the creator

### Running the Script

```bash
node add_creator_field.js
```

### How It Works

1. The script connects to the Sui network (default: devnet)
2. It creates a transaction to add the "creator" field to the Display object
3. The transaction is executed and signed with your private key
4. The script outputs confirmation and the updated Display object

## Security Notes

- Keep your private key secure and never commit it to a repository
- Consider using environment variables or a secure configuration file for sensitive values 