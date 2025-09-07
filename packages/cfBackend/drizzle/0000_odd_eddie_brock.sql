CREATE TABLE `feed_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`summary_text` text NOT NULL,
	`audio_file_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`thumbnail_url` text,
	`r2_submission_path_name` text NOT NULL,
	`sender` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`processed_at` text,
	`audio_file_url` text,
	`summary_text` text,
	`error_message` text
);
