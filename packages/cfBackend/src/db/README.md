# Database Layer with Drizzle ORM

This directory contains the database layer for the YouTube Audio Summary backend, using Drizzle ORM with Cloudflare D1.

## Structure

- `schema.ts` - Database schema definitions using Drizzle
- `index.ts` - Database connection and exports
- `queries.ts` - Database service class with common operations
- `README.md` - This documentation

## Schema

### Tables

1. **submissions** - Stores content submission data
   - `id` (TEXT PRIMARY KEY) - Unique submission ID
   - `url`, `title` - Basic content info
   - `thumbnail_url` - Thumbnail image URL
   - `r2_submission_path_name` - Path to submission data in R2 storage
   - `sender` (JSON) - Sender/client information
   - `status` - Submission status (pending, processing, completed, failed, cancelled)
   - Timestamps and processing results

2. **feed_contents** - Stores processed content for feeds
   - `id` (TEXT PRIMARY KEY) - Unique content ID
   - `submission_id` - Reference to submissions table
   - Content data (title, url, summary, audio file)
   - Timestamps

## Usage

### Database Service

```typescript
import { DatabaseService } from "./db/queries";

// Initialize with D1 database
const db = new DatabaseService(ctx.env.YT_AUDIO_SUMMARY_DB);

// Create a submission
const submission = await db.createSubmission({
  id: "sub_123",
  url: "https://youtube.com/watch?v=example",
  title: "Example Video",
  thumbnailUrl: "https://example.com/thumb.jpg",
  r2SubmissionPathName: "submissions/sub_123/submission.json",
  sender: { appName: "WebExtension", ... },
  status: "pending"
});

// Get submissions by status
const pendingSubmissions = await db.getPendingSubmissions();

// Update submission status
await db.markSubmissionAsCompleted(submissionId, audioUrl, summaryText);
```

### Direct Drizzle Usage

```typescript
import { createDatabase } from "./db";
import { submissions } from "./db/schema";

const db = createDatabase(ctx.env.YT_AUDIO_SUMMARY_DB);

// Direct query
const result = await db
  .select()
  .from(submissions)
  .where(eq(submissions.status, "pending"));
```

## Migration

### Using Drizzle Kit (Recommended)

Drizzle Kit provides powerful CLI tools for database management:

#### Environment Setup

For detailed setup instructions, see [DRIZZLE_SETUP.md](../../DRIZZLE_SETUP.md).

Quick setup:
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual credentials
nano .env
```

Required environment variables:
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_DATABASE_ID=your_database_id_here
CLOUDFLARE_D1_TOKEN=your_api_token_here
```

#### CLI Commands

```bash
# Check database configuration
pnpm db:check

# Generate migrations from schema changes
pnpm db:generate

# Apply migrations to D1 database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Drop database (use with caution)
pnpm db:drop

# Check migration status
pnpm db:migrate
```

### Manual Migration

To set up the database schema manually, run the SQL migration:

```bash
# Apply the migration to your D1 database
wrangler d1 execute yt-audio-summary --file=./migrations/0001_initial_schema.sql
```

## Type Safety

All database operations are fully typed with TypeScript:

- `Submission` - Type for selected submission records
- `NewSubmission` - Type for inserting new submissions
- `FeedContent` - Type for selected feed content records
- `NewFeedContent` - Type for inserting new feed content

## Features

- ✅ Full TypeScript support
- ✅ JSON column support for complex data
- ✅ Foreign key relationships
- ✅ Database indexes for performance
- ✅ Status enums with validation
- ✅ Timestamp tracking
- ✅ R2 storage integration
- ✅ Error handling and validation
