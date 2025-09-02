/**
 * R2 Storage Utilities for YouTube Audio Summary
 *
 * This module provides utility functions for interacting with the R2 bucket
 * to store and retrieve submission data, audio files, and other assets.
 */
import type { z } from "zod";
import { type SubmitContentInput, submitContentInput } from "./types";

export interface AudioFileMetadata {
  submissionId: string;
  originalUrl: string;
  audioFileKey: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

/**
 * Validate submission data against the Zod schema
 */
export function validateSubmissionData(data: unknown):
  | {
      success: true;
      data: SubmitContentInput;
    }
  | {
      success: false;
      error: string;
      details: z.ZodError;
    } {
  const validationResult = submitContentInput.safeParse(data);

  if (validationResult.success) {
    return {
      success: true,
      data: validationResult.data,
    };
  }
  return {
    success: false,
    error: `Validation failed: ${validationResult.error.message}`,
    details: validationResult.error,
  };
}

/**
 * Store submission metadata in R2 bucket
 */
export async function storeSubmissionMetadata(
  bucket: R2Bucket,
  submissionId: string,
  submission: SubmitContentInput
): Promise<string> {
  // Validate the submission data against the Zod schema
  const validationResult = submitContentInput.safeParse(submission);

  if (!validationResult.success) {
    console.error("Invalid submission data:", validationResult.error);
    throw new Error(
      `Invalid submission data: ${validationResult.error.message}`
    );
  }

  // Use the validated data
  const validatedSubmission = validationResult.data;

  const key = `submissions/${submissionId}/submission.json`;

  await bucket.put(key, JSON.stringify(validatedSubmission, null, 2), {
    httpMetadata: {
      contentType: "application/json",
    },
    customMetadata: {
      submissionId: submissionId,
    },
  });

  return key;
}

/**
 * Retrieve submission metadata from R2 bucket
 */
export async function getSubmissionById(
  bucket: R2Bucket,
  submissionId: string
): Promise<SubmitContentInput | null> {
  const key = `submissions/${submissionId}/submission.json`;

  const object = await bucket.get(key);
  if (!object) {
    return null;
  }

  try {
    const rawData = await object.json();

    // Validate the retrieved data against the Zod schema
    const validationResult = submitContentInput.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `Invalid data retrieved for submission ${submissionId}:`,
        validationResult.error
      );
      throw new Error(
        `Invalid data in storage for submission ${submissionId}: ${validationResult.error.message}`
      );
    }

    return validationResult.data;
  } catch (error) {
    console.error(
      `Failed to parse or validate submission ${submissionId}:`,
      error
    );
    throw error;
  }
}

/**
 * Store audio file in R2 bucket
 */
export async function storeAudioFile(
  bucket: R2Bucket,
  submissionId: string,
  audioData: ArrayBuffer,
  contentType = "audio/mpeg"
): Promise<string> {
  const key = `submissions/${submissionId}/audio.mp3`;

  await bucket.put(key, audioData, {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      submissionId,
      fileType: "audio",
    },
  });

  return key;
}

/**
 * Get audio file URL from R2 bucket
 */
export async function getAudioFileUrl(
  bucket: R2Bucket,
  submissionId: string
): Promise<string | null> {
  const key = `submissions/${submissionId}/audio.mp3`;

  const object = await bucket.head(key);
  if (!object) {
    return null;
  }

  // Return the R2 object URL (this would need to be configured with a custom domain)
  // For now, return the key which can be used with R2's public URL
  return key;
}

/**
 * List all submissions in the bucket
 */
export async function listSubmissions(
  bucket: R2Bucket,
  limit = 100
): Promise<SubmitContentInput[]> {
  const objects = await bucket.list({
    prefix: "submissions/",
    delimiter: "/",
    limit,
  });

  const submissions: SubmitContentInput[] = [];

  for (const object of objects.objects) {
    if (object.key.endsWith("/submission.json")) {
      try {
        const metadata = await bucket.get(object.key);
        if (metadata) {
          const rawData = await metadata.json();

          // Validate the retrieved data
          const validationResult = submitContentInput.safeParse(rawData);
          if (validationResult.success) {
            submissions.push(validationResult.data);
          } else {
            console.error(
              `Invalid data in ${object.key}:`,
              validationResult.error
            );
          }
        }
      } catch (error) {
        console.error(`Failed to parse metadata for ${object.key}:`, error);
      }
    }
  }

  // Sort by the sender timestamp if available
  return submissions.sort((a, b) => {
    const timeA = new Date(a.sender.timestamp).getTime();
    const timeB = new Date(b.sender.timestamp).getTime();
    return timeB - timeA; // Most recent first
  });
}

/**
 * Delete submission and all associated files
 */
export async function deleteSubmission(
  bucket: R2Bucket,
  submissionId: string
): Promise<void> {
  // List all objects with the submission prefix
  const objects = await bucket.list({
    prefix: `submissions/${submissionId}/`,
  });

  // Delete all objects
  const deletePromises = objects.objects.map((obj) => bucket.delete(obj.key));
  await Promise.all(deletePromises);
}
