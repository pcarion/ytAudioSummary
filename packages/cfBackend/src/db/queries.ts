import { eq, desc, and } from "drizzle-orm";
import {
  createDatabase,
  submissions,
  feedContents,
  type NewSubmission,
  type NewFeedContent,
} from "./index";

// Database utility functions for common operations

export class DatabaseService {
  private db: ReturnType<typeof createDatabase>;

  constructor(d1: D1Database) {
    this.db = createDatabase(d1);
  }

  // Submission operations
  async createSubmission(submissionData: NewSubmission) {
    const result = await this.db
      .insert(submissions)
      .values(submissionData)
      .returning();
    return result[0];
  }

  async getSubmissionById(submissionId: string) {
    const result = await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);
    return result[0] || null;
  }

  async updateSubmissionStatus(
    submissionId: string,
    status: "pending" | "processing" | "completed" | "failed" | "cancelled",
    additionalData?: Partial<NewSubmission>
  ) {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      ...additionalData,
    };

    const result = await this.db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, submissionId))
      .returning();
    return result[0];
  }

  async getSubmissionsByStatus(
    status: "pending" | "processing" | "completed" | "failed" | "cancelled",
    limit = 100
  ) {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.status, status))
      .orderBy(desc(submissions.createdAt))
      .limit(limit);
  }

  async getAllSubmissions(limit = 100) {
    return await this.db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt))
      .limit(limit);
  }

  // Feed content operations
  async createFeedContent(feedData: NewFeedContent) {
    const result = await this.db
      .insert(feedContents)
      .values(feedData)
      .returning();
    return result[0];
  }

  async getFeedContents(limit = 100) {
    return await this.db
      .select({
        id: feedContents.id,
        title: feedContents.title,
        url: feedContents.url,
        summaryText: feedContents.summaryText,
        audioFileUrl: feedContents.audioFileUrl,
        createdAt: feedContents.createdAt,
        submission: {
          id: submissions.id,
          status: submissions.status,
        },
      })
      .from(feedContents)
      .innerJoin(submissions, eq(feedContents.submissionId, submissions.id))
      .orderBy(desc(feedContents.createdAt))
      .limit(limit);
  }

  // Utility methods
  async getPendingSubmissions(limit = 50) {
    return await this.getSubmissionsByStatus("pending", limit);
  }

  async getCompletedSubmissions(limit = 100) {
    return await this.getSubmissionsByStatus("completed", limit);
  }

  async markSubmissionAsProcessing(submissionId: string) {
    return await this.updateSubmissionStatus(submissionId, "processing", {
      processedAt: new Date().toISOString(),
    });
  }

  async markSubmissionAsCompleted(
    submissionId: string,
    audioFileUrl?: string,
    summaryText?: string
  ) {
    return await this.updateSubmissionStatus(submissionId, "completed", {
      processedAt: new Date().toISOString(),
      audioFileUrl,
      summaryText,
    });
  }

  async markSubmissionAsFailed(submissionId: string, errorMessage: string) {
    return await this.updateSubmissionStatus(submissionId, "failed", {
      processedAt: new Date().toISOString(),
      errorMessage,
    });
  }

  async cancelSubmission(submissionId: string) {
    return await this.updateSubmissionStatus(submissionId, "cancelled");
  }
}
