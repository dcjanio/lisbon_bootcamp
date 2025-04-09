# SIX Token Package

This package implements a simple token swap system where users can swap SUI for SIX tokens and vice versa. The system includes a 1% fee on both swap and burn operations.

## Prerequisites

1. Install the Sui CLI (version 1.46.2 or later)
2. Have a Sui wallet with sufficient SUI for gas fees (recommended at least 1 SUI)
3. Have the package source code ready

## Publishing the Package

1. First, ensure you're in the correct directory:
```bash
cd /...
```

2. Publish the package with a sufficient gas budget:
```bash
sui client publish --gas-budget 50000000
```

3. After successful publication, note down:
   - The package ID
   - The TreasuryCap object ID
   - The Treasury object ID
   - The AdminCap object ID

## Swapping SUI for SIX Tokens

### Step 1: Check Your SUI Balance
```bash
sui client gas
```
This will show your current SUI balance and gas coins.

### Step 2: Prepare the Swap Command
You'll need:
- TreasuryCap object ID
- Treasury object ID
- A SUI coin with the amount you want to swap

### Step 3: Execute the Swap
```bash
sui client call \
  --function swap_for_six \
  --module six \
  --package <PACKAGE_ID> \
  --args <TREASURY_CAP_ID> <TREASURY_ID> <SUI_COIN_ID> \
  --gas-budget 10000000
```

Example:
```bash
sui client call \
  --function swap_for_six \
  --module six \
  --package 0x4f3c49991e1ce4dc7708ed483b5abc4f5fc925a2efd1159b19d43aeb43ece334 \
  --args 0x7e179164a7156b533177e7aee4f876a1b5d5b6b402ad4ac8aaaae657763385d9 \
        0xddfeb01df81132a040e275945b3e36bcab90db6ee77256cd70dee1a3b4470249 \
        0xe8c7b13ad5bfc620d768d284cc3ffe84867b4fc91432bd1fe2750661ae737c45 \
  --gas-budget 10000000
```

### Step 4: Verify the Swap
1. Check your SIX token balance:
```bash
sui client objects
```
Look for objects of type `0x4f3c49991e1ce4dc7708ed483b5abc4f5fc925a2efd1159b19d43aeb43ece334::six::SIX`

2. Check your SUI balance:
```bash
sui client gas
```

## Burning SIX Tokens Back to SUI

### Step 1: Check Your SIX Token Balance
```bash
sui client objects
```
Note the ID of your SIX token coin.

### Step 2: Prepare the Burn Command
You'll need:
- TreasuryCap object ID
- Treasury object ID
- Your SIX token coin ID

### Step 3: Execute the Burn
```bash
sui client call \
  --function burn_six_for_sui \
  --module six \
  --package <PACKAGE_ID> \
  --args <TREASURY_CAP_ID> <TREASURY_ID> <SIX_COIN_ID> \
  --gas-budget 10000000
```

Example:
```bash
sui client call \
  --function burn_six_for_sui \
  --module six \
  --package 0x4f3c49991e1ce4dc7708ed483b5abc4f5fc925a2efd1159b19d43aeb43ece334 \
  --args 0x7e179164a7156b533177e7aee4f876a1b5d5b6b402ad4ac8aaaae657763385d9 \
        0xddfeb01df81132a040e275945b3e36bcab90db6ee77256cd70dee1a3b4470249 \
        0x165fa02b4007b5ec7ce2020fcd9d0630691948d06fb145cff0c3921e210f6efb \
  --gas-budget 10000000
```

### Step 4: Verify the Burn
1. Check your SUI balance:
```bash
sui client gas
```

2. Verify your SIX tokens were burned:
```bash
sui client objects
```

## Fees and Exchange Rates

- **Swap Fee**: 1% fee is charged on all SUI to SIX swaps
- **Burn Fee**: 20% fee is charged when burning SIX tokens back to SUI
- **Exchange Rate**: 1 SUI = 1,000,000 SIX tokens (before fees)

For example:
- When swapping 1 SUI, you receive 990,000,000 SIX tokens (1% fee deducted)
- When burning 1,000,000 SIX tokens, you receive 0.8 SUI (20% fee deducted)

All fees accumulate in the treasury and can be withdrawn by the admin.

## Important Notes

1. **Fees**:
   - Swap fee: 1% of the SUI amount being swapped
   - Burn fee: 20% of the SUI amount being returned
   - Example: Swapping 1 SUI → 990,000 SIX tokens (1% fee = 0.01 SUI)

2. **Exchange Rate**:
   - 1 SUI = 1,000,000 SIX tokens
   - Minimum swap amount: 0.001 SUI

3. **Gas Fees**:
   - Each transaction requires gas fees in SUI
   - Recommended gas budget: 10,000,000 MIST (0.01 SUI)

4. **Object IDs**:
   - Keep track of your TreasuryCap, Treasury, and AdminCap object IDs
   - These are needed for all operations

5. **Troubleshooting**:
   - If a transaction fails, check:
     - Sufficient gas balance
     - Correct object IDs
     - Minimum SUI amount requirement
     - Network connection

## Admin Functions

### Withdrawing Fees
Only the admin (holder of the `AdminCap`) can withdraw accumulated fees:

```bash
sui client call \
  --function withdraw_fees \
  --module six \
  --package <PACKAGE_ID> \
  --args <ADMIN_CAP_ID> <TREASURY_ID> \
  --gas-budget 10000000
```

The admin can withdraw all accumulated fees from both swap operations (1% fee) and burn operations (20% fee). The fees are automatically transferred to the admin's address.

## Security Notes

1. Keep your TreasuryCap and AdminCap objects secure
2. Never share your private keys or object IDs
3. Verify all object IDs before executing transactions
4. Use appropriate gas budgets for transactions
5. Monitor your wallet for unauthorized transactions 