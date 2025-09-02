PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`thumbnail_url` text NOT NULL,
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
--> statement-breakpoint
INSERT INTO `__new_submissions`("id", "url", "title", "thumbnail_url", "r2_submission_path_name", "sender", "status", "created_at", "updated_at", "processed_at", "audio_file_url", "summary_text", "error_message") SELECT "id", "url", "title", "thumbnail_url", "r2_submission_path_name", "sender", "status", "created_at", "updated_at", "processed_at", "audio_file_url", "summary_text", "error_message" FROM `submissions`;--> statement-breakpoint
DROP TABLE `submissions`;--> statement-breakpoint
ALTER TABLE `__new_submissions` RENAME TO `submissions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;