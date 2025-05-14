# Dropout NFT Collection Smart Contract

A Sui Move smart contract for creating and managing a collection of Dropout NFTs, developed for the Lisbon Bootcamp Week 5 Challenge.

## Overview

This package implements a simple NFT collection with the following features:

- Shared collection object that tracks all minted NFTs
- Support for any coin type as payment for minting NFTs
- Special entry function for SUI payments
- Rich metadata for each NFT (name, image URL, creation timestamp)
- Sui Display standard integration for beautiful rendering in wallets and explorers
- Admin capability for future management features

## Contract Details

- **Package ID**: `0x49c91084cf01f6fbe451ffc1b029e90bc208ac5569b57c2e4b01e5d2d1f05c40`
- **Collection Object ID**: `0x84fd6471cf756c054385b7fa57abaf7b66c6e993540fd115701ad8556ee8e893`
- **Network**: Sui Devnet

## Structure

The contract has the following key components:

```move
// Main NFT object
struct Dropout has key, store {
    id: UID,
    name: String,
    image_url: String,
    created_at: u64,
}

// Shared collection object
struct DropoutCollection has key {
    id: UID,
    mint_count: u64,
}

// Admin capability
struct AdminCap has key, store {
    id: UID
}
```

## Functions

### Minting

Two functions are available for minting:

1. **buy<CoinType>**: Generic function that accepts any coin type
   ```move
   public fun buy<CoinType>(
       collection: &mut DropoutCollection, 
       name: String, 
       image_url: String,
       payment: Coin<CoinType>,
       clock: &Clock,
       ctx: &mut TxContext
   ): Dropout
   ```

2. **buy_with_sui**: Convenience entry function specifically for SUI payments
   ```move
   public entry fun buy_with_sui(
       collection: &mut DropoutCollection, 
       name: String,
       image_url: String,
       payment: Coin<SUI>,
       clock: &Clock,
       ctx: &mut TxContext
   )
   ```

## Building and Publishing

To build the contract:

```bash
sui move build
```

To publish the contract to devnet:

```bash
sui client publish --gas-budget 200000000
```

## Integration

This contract is designed to work with the Dropout NFT Minter frontend application in the `my-first-sui-dapp` directory.

## Events

The contract emits events when NFTs are minted:

```move
struct NFTMinted has copy, drop {
    nft_id: ID,
    creator: address,
    name: String,
    image_url: String,
}
```

## License

MIT

---

Created for the Lisbon Bootcamp Week 5 Challenge 