CREATE TABLE `price_list` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`price_per_unit` int NOT NULL,
	`vat` int NOT NULL DEFAULT 22,
	`description` text,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`price_per_unit_cents` int NOT NULL,
	`vat` int NOT NULL DEFAULT 22,
	`total_cents` int NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_number` varchar(50) NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`client_address` text,
	`client_tax_id` varchar(50),
	`description` text,
	`subtotal_cents` int NOT NULL,
	`vat_cents` int NOT NULL,
	`total_cents` int NOT NULL,
	`payment_term` varchar(100),
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotes_quote_number_unique` UNIQUE(`quote_number`)
);
--> statement-breakpoint
ALTER TABLE `quote_items` ADD CONSTRAINT `quote_items_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE cascade ON UPDATE no action;