module dropout_nft::dropout {
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::package;
    use sui::display;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};

    /// A custom Dropout NFT
    struct Dropout has key, store {
        id: UID,
        name: String,
        image_url: String,
        created_at: u64,
    }

    /// Shared object that tracks the collection
    struct DropoutCollection has key {
        id: UID,
        mint_count: u64,
    }

    /// Capability that grants the owner permission to withdraw payment
    struct AdminCap has key, store {
        id: UID
    }

    // ===== Events =====

    struct NFTMinted has copy, drop {
        nft_id: ID,
        creator: address,
        name: String,
        image_url: String,
    }

    // ===== Constants =====
    
    // One-time witness with the correct name format (uppercase module name)
    struct DROPOUT has drop {}

    // ===== Public Functions =====

    fun init(witness: DROPOUT, ctx: &mut TxContext) {
        // Create the collection shared object
        let collection = DropoutCollection {
            id: object::new(ctx),
            mint_count: 0,
        };
        
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        // Create the Publisher for display
        let publisher = package::claim(witness, ctx);

        // Create the display for Dropout NFTs
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"description"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"A Dropout NFT from the Lisbon Bootcamp"),
            string::utf8(b"https://sui.io"),
            string::utf8(b"Lisbon Bootcamp"),
        ];

        let display = display::new_with_fields<Dropout>(
            &publisher, keys, values, ctx
        );

        // Make display immutable
        display::update_version(&mut display);

        // Transfer objects
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(collection);
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    /// Buy a new Dropout NFT using either SUI or any other coin type
    public fun buy<CoinType>(
        collection: &mut DropoutCollection, 
        name: String, 
        image_url: String,
        payment: Coin<CoinType>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Dropout {
        // Ensure minimum payment (1 coin)
        assert!(coin::value(&payment) > 0, 0);

        // We accept the payment
        transfer::public_transfer(payment, tx_context::sender(ctx));

        // Create the NFT
        let nft = Dropout {
            id: object::new(ctx),
            name,
            image_url,
            created_at: clock::timestamp_ms(clock),
        };

        // Increment counter
        collection.mint_count = collection.mint_count + 1;

        // Emit event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            creator: tx_context::sender(ctx),
            name: nft.name,
            image_url: nft.image_url,
        });

        nft
    }

    /// Convenience function to buy with SUI
    public entry fun buy_with_sui(
        collection: &mut DropoutCollection, 
        name: String,
        image_url: String,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let nft = buy(collection, name, image_url, payment, clock, ctx);
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // ===== Getters =====

    public fun name(nft: &Dropout): &String {
        &nft.name
    }

    public fun image_url(nft: &Dropout): &String {
        &nft.image_url
    }

    public fun created_at(nft: &Dropout): u64 {
        nft.created_at
    }

    public fun mint_count(collection: &DropoutCollection): u64 {
        collection.mint_count
    }
} 