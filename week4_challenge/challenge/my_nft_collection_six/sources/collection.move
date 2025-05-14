module my_nft_collection_six::collection {
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::package;
    use sui::display;
    use sui::coin::{Self, Coin};
    use sui::event;
    use six::six::{Self, SIX, CoinManager};

    // NFT struct
    struct BootcampNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        // Additional attributes
        rarity: String,
        edition: u64,
    }

    // Collection information
    struct CollectionInfo has key {
        id: UID,
        name: String,
        description: String,
        total_supply: u64,
        minted: u64,
        price: u64,
    }

    // Event emitted when an NFT is minted
    struct MintEvent has copy, drop {
        object_id: ID,
        creator: address,
        name: String,
        edition: u64,
    }

    // One-Time-Witness for the package
    struct COLLECTION has drop {}

    // ===== Constants =====
    const MAX_SUPPLY: u64 = 10;
    const MINT_PRICE: u64 = 200_000; // 0.0002 SIX tokens

    // ===== Errors =====
    const ECollectionSoldOut: u64 = 0;
    const EInvalidPayment: u64 = 1;

    // ===== Functions =====

    // Initialize the collection on module publish
    fun init(witness: COLLECTION, ctx: &mut TxContext) {
        // Create the collection info object
        let collection_info = CollectionInfo {
            id: object::new(ctx),
            name: string::utf8(b"Bootcamp NFT Collection"),
            description: string::utf8(b"A collection of NFTs created for the Sui Bootcamp"),
            total_supply: MAX_SUPPLY,
            minted: 0,
            price: MINT_PRICE,
        };

        // Create the Publisher object
        let publisher = package::claim(witness, ctx);

        // Create the Display object without the creator field
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"rarity"),
            string::utf8(b"edition"),
            string::utf8(b"project_url"),
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"{rarity}"),
            string::utf8(b"{edition}"),
            string::utf8(b"https://sui.io/"),
        ];

        // Create the Display object
        let display = display::new_with_fields<BootcampNFT>(
            &publisher, keys, values, ctx
        );

        // Commit the Display
        display::update_version(&mut display);

        // Transfer objects
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::share_object(collection_info);
    }

    // Mint a new NFT with payment in SIX
    public fun mint(
        collection_info: &mut CollectionInfo,
        payment: Coin<SIX>,
        name: String,
        description: String,
        image_url: String,
        rarity: String,
        ctx: &mut TxContext
    ) {
        // Check if we've reached max supply
        assert!(collection_info.minted < collection_info.total_supply, ECollectionSoldOut);
        
        // Check payment amount
        assert!(coin::value(&payment) >= collection_info.price, EInvalidPayment);
        
        // Burn the payment
        coin::destroy_zero(coin::split(&mut payment, collection_info.price, ctx));
        
        // Transfer remaining balance back to sender
        transfer::public_transfer(payment, tx_context::sender(ctx));
        
        // Increment minted count
        collection_info.minted = collection_info.minted + 1;
        
        // Create the NFT
        let nft = BootcampNFT {
            id: object::new(ctx),
            name,
            description,
            image_url: url::new_unsafe(string::to_ascii(image_url)),
            rarity,
            edition: collection_info.minted,
        };
        
        // Emit mint event
        event::emit(MintEvent {
            object_id: object::id(&nft),
            creator: tx_context::sender(ctx),
            name: nft.name,
            edition: nft.edition,
        });
        
        // Transfer NFT to sender
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // Mint a new NFT without payment (for testing)
    public fun mint_free(
        collection_info: &mut CollectionInfo,
        name: String,
        description: String,
        image_url: String,
        rarity: String,
        ctx: &mut TxContext
    ) {
        // Check if we've reached max supply
        assert!(collection_info.minted < collection_info.total_supply, ECollectionSoldOut);
        
        // Increment minted count
        collection_info.minted = collection_info.minted + 1;
        
        // Create the NFT
        let nft = BootcampNFT {
            id: object::new(ctx),
            name,
            description,
            image_url: url::new_unsafe(string::to_ascii(image_url)),
            rarity,
            edition: collection_info.minted,
        };
        
        // Emit mint event
        event::emit(MintEvent {
            object_id: object::id(&nft),
            creator: tx_context::sender(ctx),
            name: nft.name,
            edition: nft.edition,
        });
        
        // Transfer NFT to sender
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // Airdrop SIX tokens to NFT owners
    public entry fun airdrop_six(
        manager: &mut CoinManager,
        _nft: &BootcampNFT,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Mint SIX tokens and transfer to the NFT owner
        six::mint_six(manager, amount, tx_context::sender(ctx), ctx);
    }

    // === Accessor functions ===
    public fun name(nft: &BootcampNFT): &String {
        &nft.name
    }

    public fun description(nft: &BootcampNFT): &String {
        &nft.description
    }

    public fun image_url(nft: &BootcampNFT): &Url {
        &nft.image_url
    }

    public fun rarity(nft: &BootcampNFT): &String {
        &nft.rarity
    }

    public fun edition(nft: &BootcampNFT): u64 {
        nft.edition
    }
} 