# NFT Collection with SIX Tokens

This is a Sui Move implementation of an NFT collection that integrates the SIX token from week2 of the bootcamp. The project includes:

- A collection of NFTs with a max supply of 10
- Integration with SIX tokens as the payment method
- Escrow system for buying and selling NFTs
- Display standard implementation
- Airdrop functionality for distributing SIX tokens to NFT holders

## Deployed Objects

The package has been successfully deployed with the following object IDs:

- **Package ID**: `0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e`
- **CoinManager ID**: `0x1dd0abd123bd0f28e183a944994719f40889d71df49619bb2c3fa645a48112b2`
- **CollectionInfo ID**: `0xead1c5c621ff184a423ba390dcf4431750c1ea7571b9110caa722f1f9c6f8aad`
- **Display ID**: `0x373b23efd458b27662c6f345cce325f432ae1100fa367588fd69116404d3288d`

## Features

- **SIX Token Integration**: NFTs can be purchased using SIX tokens
- **Escrow System**: Secure NFT trading without using Kiosk
- **Display Standard**: Custom display for NFTs without the "creator" field
- **Airdrop Functionality**: SIX tokens can be distributed to NFT holders

## Usage

### 1. Publishing the Package

```bash
sui client publish --gas-budget 100000000
```

### 2. Swapping SUI for SIX Tokens

Before you can mint NFTs, you need SIX tokens:

```bash
sui client call --gas-budget 100000000 --function swap_sui_for_six --module six --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args 0x1dd0abd123bd0f28e183a944994719f40889d71df49619bb2c3fa645a48112b2 <SUI_COIN_ID>
```

### 3. Minting an NFT

Mint an NFT using your SIX tokens:

```bash
sui client call --gas-budget 100000000 --function mint_nft_with_six --module ptb --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args 0xead1c5c621ff184a423ba390dcf4431750c1ea7571b9110caa722f1f9c6f8aad <SIX_COIN_ID> "My NFT" "A description of my NFT" "https://example.com/image.png" "Rare"
```

For testing purposes, you can also mint an NFT without payment using:

```bash
sui client call --gas-budget 100000000 --function mint_free --module collection --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args 0xead1c5c621ff184a423ba390dcf4431750c1ea7571b9110caa722f1f9c6f8aad "SIX NFT #1" "My first NFT using SIX tokens" "https://example.com/nft1.png" "Common"
```

### 4. Creating an Escrow Listing

List your NFT for sale:

```bash
sui client call --gas-budget 100000000 --function create_nft_escrow --module ptb --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args <NFT_ID> 1000000
```

### 5. Buying an NFT from Escrow

Purchase an NFT that's listed in escrow:

```bash
sui client call --gas-budget 100000000 --function purchase_nft_from_escrow --module ptb --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args <ESCROW_ID> <SIX_COIN_ID>
```

### 6. Cancelling an Escrow Listing

Cancel your escrow listing (only the seller can do this):

```bash
sui client call --gas-budget 100000000 --function cancel_nft_escrow --module ptb --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args <ESCROW_ID>
```

### 7. Airdroping SIX Tokens to NFT Holders

Send SIX tokens to NFT holders:

```bash
sui client call --gas-budget 100000000 --function airdrop_six_to_nft_holder --module ptb --package 0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e --args 0x1dd0abd123bd0f28e183a944994719f40889d71df49619bb2c3fa645a48112b2 <NFT_ID> 1000000
```

## Testing Results

The package has been successfully tested with:

1. Publishing the package
2. Minting an NFT using the free mint function:
   - NFT ID: `0xafb29ca1edc43c32309245696e32139e9b426b98d000e3c88a1d70bd8f5ddca1`
3. Creating an escrow listing for the NFT (price: 1,000,000 SIX):
   - Escrow ID: `0x66d18488a0971aa0fb4b5c7f102c35d7c4696ad20b3044c9a45f279424b8cf19`
4. Cancelling the escrow listing

All operations worked as expected, confirming the proper integration of the SIX token with the NFT collection.

## Integration Details

This project integrates the SIX token from week2_challenge with the NFT collection from week4_challenge. Key integration points include:

1. Using SIX tokens for payments instead of GOLD tokens
2. Adapting the escrow system to handle SIX tokens
3. Implementing airdrop functionality for SIX tokens
4. Creating PTBs (Programmable Transaction Builders) for common operations

## SDK Integration

To add the "creator" field to the Display, use the SDK script in the `sdk` directory:

1. Edit `add_creator_field.js` to configure:
   - `PRIVATE_KEY`: Your private key in base64 format
   - `PACKAGE_ID`: `0xe2483df9c5321a14077866b7e9de5372a830a7e6fdfafcdf5d5d7b1852588a9e`
   - `DISPLAY_ID`: `0x373b23efd458b27662c6f345cce325f432ae1100fa367588fd69116404d3288d`
   - `CREATOR_ADDRESS`: Your address

2. Run the script:
   ```bash
   cd sdk
   npm install
   node add_creator_field.js
   ```

## Notes

- SIX tokens have a 1% fee on swaps and burns
- The NFT collection has a maximum supply of 10
- All transactions require a gas budget (recommended: 100,000,000 MIST / 0.1 SUI) 