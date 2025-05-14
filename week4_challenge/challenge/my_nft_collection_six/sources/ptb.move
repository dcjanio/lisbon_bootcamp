module my_nft_collection_six::ptb {
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin};
    use six::six::{Self, SIX, CoinManager};
    use my_nft_collection_six::collection::{Self, CollectionInfo, BootcampNFT};
    use my_nft_collection_six::escrow::{Self, Escrow};
    
    // PTB for minting an NFT using SIX tokens
    public entry fun mint_nft_with_six(
        collection_info: &mut CollectionInfo,
        payment: Coin<SIX>,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        rarity: vector<u8>,
        ctx: &mut TxContext
    ) {
        let name_str = std::string::utf8(name);
        let description_str = std::string::utf8(description);
        let image_url_str = std::string::utf8(image_url);
        let rarity_str = std::string::utf8(rarity);
        
        collection::mint(collection_info, payment, name_str, description_str, image_url_str, rarity_str, ctx);
    }
    
    // PTB for creating an escrow listing
    public entry fun create_nft_escrow(
        nft: BootcampNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        escrow::create_escrow(nft, price, ctx);
    }
    
    // PTB for purchasing an NFT from escrow
    public entry fun purchase_nft_from_escrow(
        escrow_obj: &mut Escrow,
        payment: Coin<SIX>,
        ctx: &mut TxContext
    ) {
        escrow::complete_escrow(escrow_obj, payment, ctx);
    }
    
    // PTB for cancelling an escrow listing
    public entry fun cancel_nft_escrow(
        escrow_obj: &mut Escrow,
        ctx: &mut TxContext
    ) {
        escrow::cancel_escrow(escrow_obj, ctx);
    }
    
    // PTB for swapping SUI for SIX and minting an NFT in one transaction
    public entry fun swap_and_mint_nft(
        manager: &mut CoinManager,
        collection_info: &mut CollectionInfo,
        sui_payment: Coin<sui::sui::SUI>,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        rarity: vector<u8>,
        ctx: &mut TxContext
    ) {
        // First swap SUI for SIX
        six::swap_sui_for_six(manager, sui_payment, ctx);
        
        // Get SIX coins from the sender's inventory
        // Note: In a real implementation, you would retrieve the SIX coins from the user's inventory
        // but for this example, we'll just create a dummy coin to represent the payment
        let payment = coin::zero<SIX>(ctx);
        
        // Then mint the NFT
        let name_str = std::string::utf8(name);
        let description_str = std::string::utf8(description);
        let image_url_str = std::string::utf8(image_url);
        let rarity_str = std::string::utf8(rarity);
        
        collection::mint(collection_info, payment, name_str, description_str, image_url_str, rarity_str, ctx);
    }
    
    // PTB for airdropping SIX tokens to NFT holders
    public entry fun airdrop_six_to_nft_holder(
        manager: &mut CoinManager,
        nft: &BootcampNFT,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Use the collection module's airdrop function
        collection::airdrop_six(manager, nft, amount, ctx);
    }
} 