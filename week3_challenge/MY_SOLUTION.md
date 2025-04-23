# Week 3 Challenge Solution

This solution implements all the required functionality for the Six Token contract challenge.

## Prerequisites

- Sui CLI installed and configured
- Node.js and npm installed
- An active Sui wallet with some SUI tokens

## Setup

1. Make sure you have the right network selected:
   ```
   sui client switch --env devnet
   ```

2. Make sure you have SUI tokens:
   ```
   sui client gas
   ```

3. If you don't have SUI tokens, request them from the faucet:
   ```
   sui client faucet
   ```

## Project Structure

- `implementation.ts`: Contains all the required functions for the challenge
- `run.ts`: Script to execute all operations in sequence

## Functions Implemented

1. `getFirstSuiCoinId()`: Finds the first SUI coin in your wallet
2. `mintAndSendSIX(suiCoinId)`: Mints SIX tokens 
3. `stakeSIX(coinId)`: Stakes SIX tokens
4. `mintAndStakeInOnePTB(suiCoinId)`: Mints and stakes in a single transaction
5. `splitCoinIntoFour(suiCoinId)`: Splits a coin into 4 equal parts and calculates storage rebate
6. `mergeCoins(primaryCoinId, coinIdsToMerge)`: Merges coins and analyzes gas costs
7. `exchangeAndUnstake(stakedSixId, suiCoinId)`: Exchanges SUI for SIX, unstakes, and calculates rewards

## Running the Solution

Make sure the Six contract has been published first, then run:

```
cd week_3/challenge
npx ts-node run.ts
```

This will execute all operations in sequence and display the results. 