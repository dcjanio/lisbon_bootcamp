#[test_only]
module six::six_test {
    use sui::test_scenario as test;
    use sui::coin::{Self as coin, TreasuryCap};
    use sui::tx_context::TxContext;
    use six::six::{Self as six, AdminCap, Treasury, SIX};

    const ADMIN: address = @0x123;
    const USER: address = @0x456;
    const TEST_AMOUNT: u64 = 1000000000; // 1 SUI

    fun test_init(): (test::Scenario, TreasuryCap<SIX>, AdminCap) {
        let test = test::begin(ADMIN);
        let treasury_cap = test::take_from_sender<TreasuryCap<SIX>>(&test);
        six::init(&mut treasury_cap, test::test_context(&mut test));
        let admin_cap = test::take_from_sender<AdminCap>(&test);
        (test, treasury_cap, admin_cap)
    }

    #[test]
    fun test_swap_for_six() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // Create a SUI coin for testing
        let sui_coin = test::create_coin<SUI>(TEST_AMOUNT, &test);
        test::transfer_to_sender(sui_coin, &mut test);
        let sui_coin = test::take_from_sender<Coin<SUI>>(&test);
        
        // Perform swap
        let six_coin = six::swap_for_six(&mut treasury_cap, &mut treasury, sui_coin, test::test_context(&mut test));
        assert!(coin::value(&six_coin) == TEST_AMOUNT * 1000, 0);
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }

    #[test]
    fun test_burn_six_for_sui() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // First swap to get SIX tokens
        let sui_coin = test::create_coin<SUI>(TEST_AMOUNT, &test);
        test::transfer_to_sender(sui_coin, &mut test);
        let sui_coin = test::take_from_sender<Coin<SUI>>(&test);
        let six_coin = six::swap_for_six(&mut treasury_cap, &mut treasury, sui_coin, test::test_context(&mut test));
        
        // Now burn the SIX tokens
        let sui_coin = six::burn_six_for_sui(&mut treasury_cap, &mut treasury, six_coin, test::test_context(&mut test));
        assert!(coin::value(&sui_coin) == TEST_AMOUNT, 0);
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }

    #[test]
    fun test_withdraw_fees() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // Perform a swap to generate fees
        let sui_coin = test::create_coin<SUI>(TEST_AMOUNT, &test);
        test::transfer_to_sender(sui_coin, &mut test);
        let sui_coin = test::take_from_sender<Coin<SUI>>(&test);
        let _six_coin = six::swap_for_six(&mut treasury_cap, &mut treasury, sui_coin, test::test_context(&mut test));
        
        // Withdraw fees
        let fees = six::withdraw_fees(&admin_cap, &mut treasury, test::test_context(&mut test));
        assert!(coin::value(&fees) == TEST_AMOUNT * six::SWAP_FEE_PERCENT / 100, 0);
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }

    #[test]
    #[expected_failure(abort_code = six::EInsufficientSUI)]
    fun test_swap_insufficient_sui() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // Try to swap with 0 SUI
        let sui_coin = test::create_coin<SUI>(0, &test);
        test::transfer_to_sender(sui_coin, &mut test);
        let sui_coin = test::take_from_sender<Coin<SUI>>(&test);
        let _six_coin = six::swap_for_six(&mut treasury_cap, &mut treasury, sui_coin, test::test_context(&mut test));
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }

    #[test]
    #[expected_failure(abort_code = six::EInsufficientTreasury)]
    fun test_burn_insufficient_treasury() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // Try to burn SIX tokens when treasury is empty
        let six_coin = test::create_coin<SIX>(TEST_AMOUNT, &test);
        test::transfer_to_sender(six_coin, &mut test);
        let six_coin = test::take_from_sender<Coin<SIX>>(&test);
        let _sui_coin = six::burn_six_for_sui(&mut treasury_cap, &mut treasury, six_coin, test::test_context(&mut test));
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }

    #[test]
    #[expected_failure(abort_code = six::ENotAdmin)]
    fun test_withdraw_fees_not_admin() {
        let (test, mut treasury_cap, admin_cap) = test_init();
        let treasury = test::take_shared<Treasury>(&test);
        
        // Switch to non-admin user
        test::next_tx(&mut test, USER);
        
        // Try to withdraw fees as non-admin
        let _fees = six::withdraw_fees(&admin_cap, &mut treasury, test::test_context(&mut test));
        
        // Cleanup
        test::return_shared(treasury, &mut test);
        test::return_to_sender(treasury_cap, &mut test);
        test::return_to_sender(admin_cap, &mut test);
        test::end(test);
    }
} 