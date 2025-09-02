-- Initial database schema for YouTube Audio Summary
-- This migration creates the core tables for the application

-- Submissions table - stores the main submission data
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    r2_submission_path_name TEXT NOT NULL,
    sender TEXT NOT NULL, -- JSON data for sender information
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT,
    audio_file_url TEXT,
    summary_text TEXT,
    error_message TEXT
);

-- Feed contents table - stores processed content for the feed
CREATE TABLE IF NOT EXISTS feed_contents (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    audio_file_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_feed_contents_created_at ON feed_contents(created_at);
