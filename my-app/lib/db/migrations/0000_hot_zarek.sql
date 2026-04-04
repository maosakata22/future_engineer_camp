CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`image_url` text,
	`is_available` integer DEFAULT true,
	`is_popular` integer DEFAULT false,
	`area` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_price` real NOT NULL,
	`order_items` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer
);
