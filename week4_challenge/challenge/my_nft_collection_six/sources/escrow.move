module my_nft_collection_six::escrow {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::dynamic_object_field as dof;
    use my_nft_collection_six::collection::{BootcampNFT};
    use six::six::{SIX};

    // Escrow object to facilitate trades
    struct Escrow has key {
        id: UID,
        seller: address,
        nft_id: ID,
        price: u64,
        is_active: bool,
    }

    // Events
    struct EscrowCreatedEvent has copy, drop {
        escrow_id: ID,
        seller: address,
        nft_id: ID,
        price: u64,
    }

    struct EscrowCompletedEvent has copy, drop {
        escrow_id: ID,
        seller: address,
        buyer: address,
        nft_id: ID,
        price: u64,
    }

    struct EscrowCancelledEvent has copy, drop {
        escrow_id: ID,
        seller: address,
        nft_id: ID,
    }

    // Error codes
    const ENotSeller: u64 = 0;
    const EEscrowNotActive: u64 = 1;
    const EInsufficientPayment: u64 = 2;

    // Create a new escrow listing for an NFT
    public entry fun create_escrow(
        nft: BootcampNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id(&nft);
        let seller = tx_context::sender(ctx);
        
        // Create the escrow object
        let escrow = Escrow {
            id: object::new(ctx),
            seller,
            nft_id,
            price,
            is_active: true,
        };
        
        // Store the NFT in the escrow using dynamic object fields
        dof::add(&mut escrow.id, b"nft", nft);
        
        // Emit event
        event::emit(EscrowCreatedEvent {
            escrow_id: object::id(&escrow),
            seller,
            nft_id,
            price,
        });
        
        // Share the escrow object
        transfer::share_object(escrow);
    }

    // Complete the escrow by purchasing the NFT
    public entry fun complete_escrow(
        escrow: &mut Escrow,
        payment: Coin<SIX>,
        ctx: &mut TxContext
    ) {
        // Verify escrow is active
        assert!(escrow.is_active, EEscrowNotActive);
        
        // Verify payment is sufficient
        assert!(coin::value(&payment) >= escrow.price, EInsufficientPayment);
        
        // Extract the NFT from the escrow
        let nft = dof::remove<vector<u8>, BootcampNFT>(&mut escrow.id, b"nft");
        
        // Split the payment into the exact amount and return change
        let exact_payment = coin::split(&mut payment, escrow.price, ctx);
        
        // Transfer payment to seller
        transfer::public_transfer(exact_payment, escrow.seller);
        
        // Return change to buyer
        transfer::public_transfer(payment, tx_context::sender(ctx));
        
        // Transfer NFT to buyer
        transfer::public_transfer(nft, tx_context::sender(ctx));
        
        // Mark escrow as inactive
        escrow.is_active = false;
        
        // Emit event
        event::emit(EscrowCompletedEvent {
            escrow_id: object::id(escrow),
            seller: escrow.seller,
            buyer: tx_context::sender(ctx),
            nft_id: escrow.nft_id,
            price: escrow.price,
        });
    }

    // Cancel the escrow and return the NFT to the seller
    public entry fun cancel_escrow(
        escrow: &mut Escrow,
        ctx: &mut TxContext
    ) {
        // Verify sender is the seller
        assert!(tx_context::sender(ctx) == escrow.seller, ENotSeller);
        
        // Verify escrow is active
        assert!(escrow.is_active, EEscrowNotActive);
        
        // Extract the NFT from the escrow
        let nft = dof::remove<vector<u8>, BootcampNFT>(&mut escrow.id, b"nft");
        
        // Return NFT to seller
        transfer::public_transfer(nft, escrow.seller);
        
        // Mark escrow as inactive
        escrow.is_active = false;
        
        // Emit event
        event::emit(EscrowCancelledEvent {
            escrow_id: object::id(escrow),
            seller: escrow.seller,
            nft_id: escrow.nft_id,
        });
    }

    // === Accessor functions ===
    public fun seller(escrow: &Escrow): address {
        escrow.seller
    }

    public fun nft_id(escrow: &Escrow): ID {
        escrow.nft_id
    }

    public fun price(escrow: &Escrow): u64 {
        escrow.price
    }

    public fun is_active(escrow: &Escrow): bool {
        escrow.is_active
    }
} 