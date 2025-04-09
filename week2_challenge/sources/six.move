module six::six {
    use sui::object::{Self, UID};
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::sui::SUI;
    use std::option;

    /// Error codes
    const ENotAdmin: u64 = 0;
    const EInsufficientSUI: u64 = 1;
    const EInsufficientTreasury: u64 = 2;

    /// Constants
    const DECIMALS: u8 = 9;
    const SWAP_FEE_PERCENT: u64 = 1; // 1% fee for swapping
    const BURN_FEE_PERCENT: u64 = 20; // 20% fee for burning SIX to SUI
    const SUI_TO_SIX_RATE: u64 = 1_000_000; // 1 SUI = 1,000,000 SIX

    /// Constants for the SIX coin
    const MIN_SUI_AMOUNT: u64 = 1_000_000; // 0.001 SUI

    /// The SIX token type. This is a one-time witness type.
    public struct SIX has drop {}

    /// Capability allowing the bearer to mint and burn SIX tokens
    public struct AdminCap has key, store {
        id: UID
    }

    /// The treasury that holds SUI tokens and manages the swap
    public struct Treasury has key, store {
        id: UID,
        balance: Balance<SUI>,
        fees: Balance<SUI>
    }

    /// Initialize the SIX token and create the treasury
    fun init(witness: SIX, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"SIX",
            b"SIX Token",
            b"",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));

        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero(),
            fees: balance::zero()
        };
        transfer::share_object(treasury);

        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Calculate the amount of SIX tokens to mint based on SUI input
    public fun calculate_six_amount(sui_amount: u64): u64 {
        sui_amount * SUI_TO_SIX_RATE
    }

    /// Calculate the amount of SUI to return based on SIX input
    public fun calculate_sui_amount(six_amount: u64): u64 {
        six_amount / SUI_TO_SIX_RATE
    }

    /// Swap SUI for SIX tokens
    public entry fun swap_for_six(
        treasury_cap: &mut TreasuryCap<SIX>,
        treasury: &mut Treasury,
        sui_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sui_amount = coin::value(&sui_coin);
        assert!(sui_amount > 0, EInsufficientSUI);

        let fee = sui_amount * SWAP_FEE_PERCENT / 100;
        let swap_amount = sui_amount - fee;

        let six_amount = calculate_six_amount(swap_amount);
        let six_coin = coin::mint(treasury_cap, six_amount, ctx);

        let mut sui_balance = coin::into_balance(sui_coin);
        balance::join(&mut treasury.balance, balance::split(&mut sui_balance, swap_amount));
        balance::join(&mut treasury.fees, sui_balance);

        transfer::public_transfer(six_coin, tx_context::sender(ctx))
    }

    /// Burn SIX tokens to get SUI back
    public entry fun burn_six_for_sui(
        treasury_cap: &mut TreasuryCap<SIX>,
        treasury: &mut Treasury,
        six_coin: Coin<SIX>,
        ctx: &mut TxContext
    ) {
        let six_amount = coin::value(&six_coin);
        assert!(six_amount > 0, EInsufficientSUI);

        let sui_amount = calculate_sui_amount(six_amount);
        assert!(balance::value(&treasury.balance) >= sui_amount, EInsufficientTreasury);

        // Calculate fee (20% of the SUI amount)
        let fee = sui_amount * BURN_FEE_PERCENT / 100;
        let return_amount = sui_amount - fee;

        coin::burn(treasury_cap, six_coin);
        
        // Split the SUI into return amount and fee
        let return_coin = coin::from_balance(balance::split(&mut treasury.balance, return_amount), ctx);
        balance::join(&mut treasury.fees, balance::split(&mut treasury.balance, fee));
        
        transfer::public_transfer(return_coin, tx_context::sender(ctx))
    }

    /// Withdraw accumulated fees (admin only)
    public entry fun withdraw_fees(
        _admin_cap: &AdminCap,
        treasury: &mut Treasury,
        ctx: &mut TxContext
    ) {
        let amount = balance::value(&treasury.fees);
        let sui_coin = coin::from_balance(balance::split(&mut treasury.fees, amount), ctx);
        transfer::public_transfer(sui_coin, tx_context::sender(ctx))
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SIX {}, ctx)
    }
} 