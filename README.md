# Challenge Week 5 - Sui Task NFT App

This project is a solution for the Lisbon Bootcamp Week 5 Challenge. It demonstrates a full-stack decentralized application for managing tasks as NFTs on the Sui blockchain.

## Project Overview

The project consists of two main components:

1. **Smart Contract** - A custom Move contract for the task NFT collection
2. **Frontend Application** - A React-based UI for interacting with the contract

   
<img width="1378" alt="Screenshot 2025-05-15 at 00 49 38" src="https://github.com/user-attachments/assets/df1e23be-76ee-4ff3-9ff7-eb073e5f2c39" />
<img width="1360" alt="Screenshot 2025-05-15 at 00 50 06" src="https://github.com/user-attachments/assets/5f9183d6-fc35-4756-bf21-897ae6a7e4d5" />

   

## Features

- **Connect Wallet**: Integration with Sui wallets
- **Mint Task NFTs**: Create new tasks as NFTs with name, description, and priority
- **Task Management**: Mark tasks as complete or burn them
- **NFT Gallery**: View all your task NFTs in a responsive layout
- **Blockchain Persistence**: Store your tasks as NFTs on the Sui blockchain

## Technical Implementation

### Frontend (my-first-sui-dapp)

- Built with React, TypeScript, and Vite
- Utilizes Sui dApp Kit for wallet integration
- Features a clean, responsive UI with Radix UI components
- Includes state management with TanStack Query

### Smart Contract (todo_list)

- Written in Move language for the Sui blockchain
- Implements NFT-based task objects with proper display
- Supports minting, completing, and burning task NFTs
- Includes metadata for task details (name, description, status, priority)

## Getting Started

### Running the Frontend

```bash
cd my-first-sui-dapp
pnpm install
pnpm run dev
```

Visit the URL shown in the terminal (typically http://localhost:5178/)

### Exploring the Smart Contract

The contract is deployed on Sui devnet. To view and modify the contract:
```bash
cd todo_list
sui move build
sui client publish --gas-budget 200000000
```

## Contract Details

Package ID: `0x88a821d0e5fbbd1d2b86470182aff1061d402e042296e574b7171f72646b03e9`
TaskList ID: `0x67acba66f6e393ba2fbb08052b15d25af70af24b4637f5b043d4ef533f8b028f`

The contract implements:
- `mint_task`: Creates a new task as an NFT
- `complete_task`: Marks a task as completed
- `burn_task`: Burns (deletes) a task NFT

## Solution Approach

1. Developed a task management system using NFT technology
2. Created a modern UI for a seamless task NFT management experience
3. Implemented functionality to mint, complete and burn task NFTs
4. Added proper error handling and user feedback
5. Ensured data persistence on the blockchain as NFTs

## Future Enhancements

- Custom NFT images based on task priority or completion
- Due dates and reminders
- Task categories and labels
- Sharing tasks with other users
- Marketplace for trading completed task NFTs

---

Created for the Lisbon Bootcamp Week 5 Challenge
