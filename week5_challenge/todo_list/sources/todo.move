module todo_list::todo_list {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::package;
    use sui::display;
    use sui::url::{Self, Url};

    // NFT representing a task
    struct TaskNFT has key, store {
        id: UID,
        name: String,
        description: String,
        priority: u8,
        completed: bool,
        image_url: Url
    }

    // TaskList capability object
    struct TaskList has key {
        id: UID,
        count: u64
    }

    // One-time witness for the package
    struct TODO_LIST has drop {}

    // Priority levels
    const LOW_PRIORITY: u8 = 1;
    const MED_PRIORITY: u8 = 2;
    const HIGH_PRIORITY: u8 = 3;

    // Default image
    const DEFAULT_IMAGE: vector<u8> = b"https://raw.githubusercontent.com/dcjanio/lisbon_bootcamp/main/assets/task.png";

    fun init(witness: TODO_LIST, ctx: &mut TxContext) {
        // Create the shared TaskList object
        let task_list = TaskList {
            id: object::new(ctx),
            count: 0
        };

        // Create Publisher
        let publisher = package::claim(witness, ctx);

        // Setup NFT Display
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url")
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}")
        ];

        let display = display::new_with_fields<TaskNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        // Transfer publisher and display
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        
        // Share TaskList
        transfer::share_object(task_list);
    }

    // Mint a new task as an NFT
    public entry fun mint_task(
        task_list: &mut TaskList, 
        name: String,
        description: String,
        priority: u8,
        ctx: &mut TxContext
    ) {
        // Validate priority
        assert!(priority >= LOW_PRIORITY && priority <= HIGH_PRIORITY, 0);
        
        // Create the image URL
        let image_url = url::new_unsafe_from_bytes(DEFAULT_IMAGE);
        
        // Create the TaskNFT
        let task = TaskNFT {
            id: object::new(ctx),
            name,
            description,
            priority,
            completed: false,
            image_url
        };
        
        // Increment counter
        task_list.count = task_list.count + 1;
        
        // Transfer NFT to sender
        transfer::public_transfer(task, tx_context::sender(ctx));
    }

    // Mark task as completed
    public entry fun complete_task(task: &mut TaskNFT) {
        task.completed = true;
    }

    // Delete task (burn NFT)
    public entry fun burn_task(
        task_list: &mut TaskList, 
        task: TaskNFT
    ) {
        // Decrement counter
        task_list.count = task_list.count - 1;
        
        // Unwrap and delete the NFT
        let TaskNFT { id, name: _, description: _, priority: _, completed: _, image_url: _ } = task;
        object::delete(id);
    }

    // Getters
    public fun get_name(task: &TaskNFT): &String { &task.name }
    public fun get_description(task: &TaskNFT): &String { &task.description }
    public fun get_priority(task: &TaskNFT): u8 { task.priority }
    public fun is_completed(task: &TaskNFT): bool { task.completed }
    public fun get_task_count(task_list: &TaskList): u64 { task_list.count }
} 