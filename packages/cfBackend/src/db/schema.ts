import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Submissions table - stores the main submission data
export const submissions = sqliteTable("submissions", {
	id: text("id").primaryKey(), // submissionId
	url: text("url").notNull(),
	title: text("title").notNull(),
	thumbnailUrl: text("thumbnail_url").notNull(),
	r2SubmissionPathName: text("r2_submission_path_name").notNull(),

	// Sender information (stored as JSON)
	sender: text("sender", { mode: "json" })
		.$type<{
			appName: string;
			appVersion: string;
			timestamp: string;
			osName: string;
			userAgent: string;
		}>()
		.notNull(),

	// Submission status and tracking
	status: text("status", {
		enum: ["pending", "processing", "completed", "failed", "cancelled"],
	})
		.notNull()
		.default("pending"),
	// Timestamps
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	processedAt: text("processed_at"),

	// Processing results
	audioFileUrl: text("audio_file_url"),
	summaryText: text("summary_text"),
	errorMessage: text("error_message"),
});

// Feed contents table - stores processed content for the feed
export const feedContents = sqliteTable("feed_contents", {
	id: text("id").primaryKey(),
	submissionId: text("submission_id")
		.notNull()
		.references(() => submissions.id),

	// Content data
	title: text("title").notNull(),
	url: text("url").notNull(),
	summaryText: text("summary_text").notNull(),
	audioFileUrl: text("audio_file_url"),

	// Timestamps
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

// Export types for TypeScript
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type FeedContent = typeof feedContents.$inferSelect;
export type NewFeedContent = typeof feedContents.$inferInsert;
