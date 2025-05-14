# Challenge Week 5 - Dropout NFT Minter

This project is a solution for the Lisbon Bootcamp Week 5 Challenge. It demonstrates a full-stack decentralized application for minting NFTs on the Sui blockchain.

![Dropout NFT Minter](https://i.imgur.com/yvNbUed.png)

## Project Overview

The project consists of two main components:

1. **Smart Contract** - A custom Move contract for the Dropout NFT collection
2. **Frontend Application** - A React-based UI for interacting with the contract

## Features

- **Connect Wallet**: Integration with Slush Wallet
- **View Balances**: Display token balances (SUI, SIX, etc.)
- **Mint NFTs**: Create NFTs with custom names and images
- **Flexible Payments**: Pay with either SUI or SIX tokens
- **NFT Gallery**: View your NFT collection in a responsive layout

## Technical Implementation

### Frontend (my-first-sui-dapp)

- Built with React, TypeScript, and Vite
- Utilizes Sui dApp Kit for wallet integration
- Features a clean, responsive UI with Radix UI components
- Includes state management with TanStack Query

  <img width="726" alt="Screenshot 2025-05-14 at 23 45 57" src="https://github.com/user-attachments/assets/96183d66-1bf3-4eac-8311-89a507156e2f" />

### Smart Contract (dropout_nft)

- Written in Move language for the Sui blockchain
- Implements a shared collection object for tracking NFTs
- Supports generic payment tokens with type parameters
- Includes display configuration for NFT rendering in wallets

## Getting Started

### Running the Frontend

```bash
cd my-first-sui-dapp
pnpm install
pnpm run dev
```

Visit the URL shown in the terminal (typically http://localhost:5173/)

### Exploring the Smart Contract

The contract is already deployed on Sui devnet at:
- Package ID: `0x49c91084cf01f6fbe451ffc1b029e90bc208ac5569b57c2e4b01e5d2d1f05c40`
- Collection ID: `0x84fd6471cf756c054385b7fa57abaf7b66c6e993540fd115701ad8556ee8e893`

To view and modify the contract:
```bash
cd dropout_nft
sui move build
```

## Solution Approach

1. Developed a minimal yet feature-complete NFT smart contract
2. Created a modern UI for a seamless minting experience
3. Implemented dual payment options (SUI or SIX tokens)
4. Added proper error handling and user feedback
5. Ensured proper NFT display with metadata

## Future Enhancements

- NFT trading functionality
- Collection royalties
- Advanced metadata and attributes
- Batch minting capability
- Enhanced admin controls
