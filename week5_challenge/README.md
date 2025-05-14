# Challenge Week 5 - Sui To-Do List App

This project is a solution for the Lisbon Bootcamp Week 5 Challenge. It demonstrates a full-stack decentralized application for managing to-do items on the Sui blockchain.

## Project Overview

The project consists of two main components:

1. **Smart Contract** - A custom Move contract for the to-do list collection
2. **Frontend Application** - A React-based UI for interacting with the contract

## Features

- **Connect Wallet**: Integration with Slush Wallet
- **Add Tasks**: Create new to-do items with descriptions and priorities
- **Task Management**: Mark tasks as complete or delete them
- **Task List**: View all your tasks in a responsive layout
- **Persistence**: Store your tasks securely on the Sui blockchain

## Technical Implementation

### Frontend (my-first-sui-dapp)

- Built with React, TypeScript, and Vite
- Utilizes Sui dApp Kit for wallet integration
- Features a clean, responsive UI with Radix UI components
- Includes state management with TanStack Query

### Smart Contract (todo_list)

- Written in Move language for the Sui blockchain
- Implements a shared collection object for tracking to-do items
- Supports creating, completing, and deleting tasks
- Includes metadata for task details (description, status, priority)

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

## Solution Approach

1. Developed a simple yet full-featured to-do list smart contract
2. Created a modern UI for a seamless task management experience
3. Implemented functionality to add, complete and delete tasks
4. Added proper error handling and user feedback
5. Ensured data persistence on the blockchain

## Future Enhancements

- Task categories and labels
- Due dates and reminders
- Task priorities
- Sharing tasks with other users
- Task attachments

---

Created for the Lisbon Bootcamp Week 5 Challenge
