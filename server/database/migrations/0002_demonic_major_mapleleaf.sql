CREATE TABLE `accepted_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`user_who_accepted` text NOT NULL,
	`user_who_sent` text NOT NULL,
	`accepted_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `user_link_invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
