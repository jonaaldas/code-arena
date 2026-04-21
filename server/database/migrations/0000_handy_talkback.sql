CREATE TABLE `user_link_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`link` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
