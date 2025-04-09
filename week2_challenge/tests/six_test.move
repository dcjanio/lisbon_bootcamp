#[test_only]
module six::six_test {
    use sui::test_scenario;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;

    use six::six::{Self, SIX, CoinManager};

    const PUBLISHER: address = @0x0;
    const USER1: address = @0x1;
    const SUI_AMOUNT: u64 = 1_000_000_000; // 1 SUI
    const FEE_BASIS_POINTS: u64 = 100; // 1%
    const SIX_PER_SUI: u64 = 1_000_000; // 1 SUI = 1,000,000 SIX

    #[test]
    fun test_swap_and_burn() {
        let mut scenario_val = test_scenario::begin(PUBLISHER);
        let scenario = &mut scenario_val;
        
        // Initialize the module
        {
            test_scenario::next_tx(scenario, PUBLISHER);
            six::test_init(test_scenario::ctx(scenario));
        };

        // Get the manager object
        test_scenario::next_tx(scenario, PUBLISHER);
        let mut manager = test_scenario::take_shared<CoinManager>(scenario);

        // Mint some SUI for User1
        {
            test_scenario::next_tx(scenario, PUBLISHER);
            let sui_coin = coin::mint_for_testing<SUI>(SUI_AMOUNT, test_scenario::ctx(scenario));
            transfer::public_transfer(sui_coin, USER1);
        };

        // Calculate expected amounts
        let expected_six = (SUI_AMOUNT * SIX_PER_SUI) * (10000 - FEE_BASIS_POINTS) / 10000;
        let expected_sui = (expected_six / SIX_PER_SUI) * (10000 - FEE_BASIS_POINTS) / 10000;

        // User1 performs the swap
        test_scenario::next_tx(scenario, USER1);
        {
            let sui_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            six::swap_sui_for_six(&mut manager, sui_coin, test_scenario::ctx(scenario));
        };

        // Verify the swap
        test_scenario::next_tx(scenario, USER1);
        {
            let six_coin = test_scenario::take_from_sender<Coin<SIX>>(scenario);
            let six_value = coin::value(&six_coin);
            assert!(six_value == expected_six, 0);
            test_scenario::return_to_sender(scenario, six_coin);
        };

        // User1 performs the burn
        test_scenario::next_tx(scenario, USER1);
        {
            let six_coin = test_scenario::take_from_sender<Coin<SIX>>(scenario);
            six::burn_six_for_sui(&mut manager, six_coin, test_scenario::ctx(scenario));
        };

        // Verify the burn
        test_scenario::next_tx(scenario, USER1);
        {
            let sui_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let sui_value = coin::value(&sui_coin);
            assert!(sui_value == expected_sui, 1);
            test_scenario::return_to_sender(scenario, sui_coin);
        };

        test_scenario::return_shared(manager);
        test_scenario::end(scenario_val);
    }
} 