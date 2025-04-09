module six::six;

use sui::coin::{Self, TreasuryCap, Coin};
use sui::url;
use sui::balance::{Self, Balance};
use sui::sui::SUI;
use sui::transfer;
use sui::object::{Self, UID};
use sui::tx_context::{Self, TxContext};
use std::ascii;

public struct SIX has drop {}

// Useful constants
const SIX_PER_SUI: u64 = 1_000_000; // 1 SUI buys 1,000,000 SIX
const FEE_BASIS_POINTS: u64 = 100; // 1% fee

// Errors
const EInsufficientSuiInPool: u64 = 1;

public struct CoinManager has key, store {
    id: UID,
    treasury_cap: TreasuryCap<SIX>,
    sui_pool: Balance<SUI>,
    admin_address: address
}

fun init(witness: SIX, ctx: &mut TxContext) {
    let decimals: u8 = 9;
    let symbol: vector<u8> = b"SIX";
    let name: vector<u8> = b"SIX Token";
    let description: vector<u8> = b"A simple test token";
    let icon = url::new_unsafe(ascii::string(b"https://six.com"));
    let (treasury_cap, metadata) = coin::create_currency<SIX>(
        witness,
        decimals,
        symbol,
        name,
        description,
        option::some(icon),
        ctx
    );

    let manager = CoinManager {
        id: object::new(ctx),
        treasury_cap: treasury_cap,
        sui_pool: balance::zero<SUI>(),
        admin_address: ctx.sender()
    };

    transfer::public_freeze_object(metadata);
    transfer::public_share_object(manager);
}

public fun swap_sui_for_six(
    manager: &mut CoinManager,
    sui_coin: Coin<SUI>,
    ctx: &mut TxContext
) {
    let sui_value = coin::value(&sui_coin);
    let sui_fee = sui_value * FEE_BASIS_POINTS / 10000;
    let sui_value_after_fee = sui_value - sui_fee;
    let six_to_mint = sui_value_after_fee * SIX_PER_SUI;

    let new_six = coin::mint(&mut manager.treasury_cap, six_to_mint, ctx);

    let mut sui_balance = coin::into_balance(sui_coin);
    let fee_balance = balance::split(&mut sui_balance, sui_fee);
    let fee_coin = coin::from_balance(fee_balance, ctx);
    transfer::public_transfer(fee_coin, manager.admin_address);

    balance::join(&mut manager.sui_pool, sui_balance);
    transfer::public_transfer(new_six, ctx.sender());
}

public fun burn_six_for_sui(
    manager: &mut CoinManager,
    six_to_burn: Coin<SIX>,
    ctx: &mut TxContext
) {
    let six_value = coin::value(&six_to_burn);
    let sui_to_return = six_value / SIX_PER_SUI;
    assert!(balance::value(&manager.sui_pool) >= sui_to_return, EInsufficientSuiInPool);

    coin::burn(&mut manager.treasury_cap, six_to_burn);

    let sui_fee = sui_to_return * FEE_BASIS_POINTS / 10000;
    let gross_sui_balance = balance::split(&mut manager.sui_pool, sui_to_return);
    let mut gross_sui_coin = coin::from_balance(gross_sui_balance, ctx);
    let fee_coin = coin::split(&mut gross_sui_coin, sui_fee, ctx);
    transfer::public_transfer(fee_coin, manager.admin_address);
    transfer::public_transfer(gross_sui_coin, ctx.sender());
}

#[test_only]
public fun test_init(ctx: &mut TxContext) {
    init(SIX {}, ctx);
}