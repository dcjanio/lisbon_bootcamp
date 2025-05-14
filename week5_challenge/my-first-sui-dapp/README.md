# Dropout NFT Minter

A modern web application for minting NFTs on the Sui blockchain, built as part of the Lisbon Bootcamp Week 5 Challenge.

![Dropout NFT Minter Screenshot](https://i.imgur.com/yvNbUed.png)

## Features

- Connect your Sui wallet (Slush Wallet)
- View your token balances ($SUI, $SIX, etc.)
- Mint custom NFTs with your chosen name and image
- Dual payment option: pay with either SUI or SIX tokens
- View your NFT collection in a responsive grid layout
- Each NFT links to the Sui Explorer for detailed viewing

## Technology Stack

- **Frontend**: 
  - React with TypeScript
  - Vite for fast development and builds
  - Radix UI for modern UI components
  - TanStack Query for efficient state management
- **Blockchain**:
  - Sui dApp Kit for wallet integration
  - Custom Move smart contract for NFTs
  - Sui devnet deployment

## Smart Contracts

The application interacts with a custom Dropout NFT collection contract deployed on Sui devnet:

- **Package ID**: `0x49c91084cf01f6fbe451ffc1b029e90bc208ac5569b57c2e4b01e5d2d1f05c40`
- **Collection ID**: `0x84fd6471cf756c054385b7fa57abaf7b66c6e993540fd115701ad8556ee8e893`

The contract supports:
- Minting NFTs with any coin type
- Dedicated entry function for SUI payments 
- Storing NFT metadata (name, image URL)
- Display standard for proper rendering in wallets and explorers

## Installation

1. Clone the repository
2. Install dependencies:
```
pnpm install
```
3. Run the development server:
```
pnpm run dev
```
4. Open http://localhost:5173/ in your browser (or the port shown in the terminal)

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the top right to connect your Slush Wallet
2. **Configure NFT**:
   - Enter a name for your NFT
   - Provide an image URL (public URL to any image)
   - Choose payment method (SUI or SIX tokens)
3. **Mint NFT**: Click the "Mint NFT" button
4. **View Collection**: Scroll down to see your NFT collection

## Development

The project structure:
- `src/App.tsx` - Main application layout
- `src/WalletStatus.tsx` - Wallet connection status
- `src/Balances.tsx` - Display token balances
- `src/MintNFTForm.tsx` - NFT minting functionality
- `src/OwnedObjects.tsx` - Display NFT collection

The smart contract can be found in:
- `../dropout_nft/sources/dropout.move` - Dropout NFT collection contract

## License

MIT

---

Created for the Lisbon Bootcamp Week 5 Challenge
