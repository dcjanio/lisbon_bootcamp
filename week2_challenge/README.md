# SIX Token Package

A simple token package that allows users to:
1. Swap SUI for SIX tokens (1% fee)
2. Burn SIX tokens back to SUI (1% fee)

## Package Information
- Package ID: `0xd3e265f41b21597610895841c281b83463c35b2865c5446fc56afde5ab07cd30`
- CoinManager ID: `0xac0fe85b143bd18be1b47389e86a877172a3fb833c5a0239b9441d051a7bfcc0`

## Features
- Exchange rate: 1 SUI = 1,000,000 SIX
- Fee: 1% on both swaps and burns
- Fees are collected in the CoinManager

## Gas Requirements
- Simple transactions (swaps, burns): 10,000,000 MIST (0.01 SUI)

## Security Notes
- The CoinManager object is shared and can be accessed by anyone
- All operations are protected by appropriate checks
- Fees are automatically deducted and stored in the CoinManager

## Testing
The package has been tested with:
1. Unit tests (`sui move test`)
2. Live tests on testnet:
   - Swapped 0.000001 SUI for 990 SIX (1% fee)
   - Burned 990 SIX back to SUI (1% fee)

### Transaction History
- Package Deployment: `97QB4mdCv7xRaQykJN4yqraUuuCAKJNYcLCdCEZUj1o9`
- Swap Transaction: `GnctNBDTzGWDDWczbpYYhVRHTTiyRv4qmMcEv8nU5P1n`
- Burn Transaction: `bmwHPL2RrUPiACbRNpJdaG3oxKodFcCnWpv71SaAWLs`

You can view the complete transaction history on [SuiScan](https://suiscan.xyz/testnet/account/0x0a094d9aceabdf55e16d3bee60bd16d6631e03ba3c8d47f66e3c4966d87806f4/activity).

## Example Commands

### Swap SUI for SIX
```bash
sui client call --function swap_sui_for_six --module six --package 0xd3e265f41b21597610895841c281b83463c35b2865c5446fc56afde5ab07cd30 --args 0xac0fe85b143bd18be1b47389e86a877172a3fb833c5a0239b9441d051a7bfcc0 <SUI_COIN_ID> --gas-budget 100000000
```

### Burn SIX for SUI
```bash
sui client call --function burn_six_for_sui --module six --package 0xd3e265f41b21597610895841c281b83463c35b2865c5446fc56afde5ab07cd30 --args 0xac0fe85b143bd18be1b47389e86a877172a3fb833c5a0239b9441d051a7bfcc0 <SIX_COIN_ID> --gas-budget 100000000
```

## Prerequisites

1. Install the [Sui CLI](https://docs.sui.io/sui-cli/install-sui-cli) (version **1.46.2 or later**)
2. Have a wallet with enough SUI for testing (recommended: 1 SUI or more)
3. Clone/download this package source code

## Gas Tokens and Transaction Costs

In Sui, all transactions require gas fees paid in SUI tokens. Here's what you need to know:

1. **Gas Budget**: Each transaction requires a gas budget (in MIST, where 1 SUI = 1,000,000,000 MIST)
   - Simple transactions: 2,000,000 MIST (0.002 SUI)
   - Complex transactions: 10,000,000 MIST (0.01 SUI)

2. **Gas Objects**: 
   - Gas fees are paid from SUI coins in your wallet
   - You can specify which coin to use with the `--gas` parameter
   - If not specified, the system will automatically select a coin

3. **Gas Price**: 
   - Current gas price: 1,000 MIST per unit
   - This is set in the transaction parameters

4. **Gas Costs**:
   - Storage Cost: Varies based on object size
   - Computation Cost: Fixed per operation
   - Storage Rebate: Partial refund for deleted objects
   - Non-refundable Storage Fee: Small fixed fee

## Publishing the Package

```bash
sui client publish --gas-budget 50000000
```

Take note of the following object IDs created during publish:
- **Package ID**
- **TreasuryCap Object ID**
- **Treasury Object ID**
- **AdminCap Object ID**

## Swapping SUI for SIX

### 1. Check SUI Balance
```bash
sui client gas
```

### 2. Execute Swap
```bash
sui client call --function swap_for_six --module six --package <PACKAGE_ID> --args <TREASURY_CAP_ID> <TREASURY_ID> <SUI_COIN_ID> --gas-budget 2000000
```

## Burning SIX for SUI

### 1. Check SIX Balance
```bash
sui client objects
```

### 2. Execute Burn
```bash
sui client call --function burn_six_for_sui --module six --package <PACKAGE_ID> --args <TREASURY_CAP_ID> <TREASURY_ID> <SIX_COIN_ID> --gas-budget 2000000
```

## Withdrawing Fees

Only the admin (holder of the `AdminCap`) can withdraw accumulated fees from both:
- Swap operations (1% fee)
- Burn operations (20% fee)

```bash
sui client call --function withdraw_fees --module six --package <PACKAGE_ID> --args <ADMIN_CAP_ID> <TREASURY_ID> --gas-budget 10000000
```

The fees are automatically transferred to the admin's address.

## Security Notes

1. Keep AdminCap and TreasuryCap safe
2. Never share your private keys
3. Always verify transaction details before signing
4. Use appropriate gas budgets for transactions
5. Monitor your gas coin balances

## Testing

The package includes comprehensive tests that verify:
- Token swapping functionality
- Fee calculations (1% for swaps, 20% for burns)
- Admin fee withdrawal
- Error handling for invalid operations

Run tests with:
```bash
sui move test
```

## Notes

- Minimum swap: `0.001 SUI`
- Gas budget: `10,000,000 MIST` (~0.01 SUI)
- Always double-check your object IDs before transactions

## Security Best Practices

1. Keep AdminCap and TreasuryCap safe
2. Never share your private keys
3. Validate object types with `sui client objects`
4. Monitor balances and test before production use
