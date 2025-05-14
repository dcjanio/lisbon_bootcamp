# Week 3 Challenge: SIX Token Contract with PTB

This folder contains the implementation of the Week 3 Challenge for the Sui Move Bootcamp. The challenge involves implementing Programmable Transaction Blocks (PTBs) with the Sui SDK to interact with a custom SIX token contract.

## Folder Structure

- `WORKING_STATUS.md`: Overview of what's working and what needs improvement
- `MY_SOLUTION.md`: Documentation on how to run the solution
- `README.md`: Original challenge requirements
- `implementation.ts`: Main implementation of all required PTB functions
- `run.ts`: Script to execute the implementation
- `solution/`: Directory containing the Move contract and supporting files
  - `sources/six.move`: The SIX token contract code
  - `Move.toml`: Contract configuration
  - `ids.ts`: Contract IDs after deployment
  - Other supporting files for testing and deployment

## Key Features

1. **Contract Implementation**:
   - Custom SIX token with swapping and staking functionality
   - Built-in reward mechanism for staked tokens

2. **PTB Implementations**:
   - Minting SIX tokens by swapping SUI
   - Staking SIX tokens for rewards
   - Combined mint and stake operations in a single transaction
   - Coin splitting and merging with gas analysis
   - Exchange and unstake operations with reward calculation

## How to Run

1. Ensure you have the Sui CLI installed and configured
2. Make sure you're on the devnet network: `sui client switch --env devnet`
3. Publish the contract: `cd solution && sui client publish --gas-budget 100000000`
4. Run the implementation: `npx ts-node run.ts`

## Next Steps

See `WORKING_STATUS.md` for details on planned improvements and next steps. 