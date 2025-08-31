// tRPC Procedures with Zod validation

import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { AudioStreamData, AudioAnalysisResult, PaginationParams } from './types';

// Initialize tRPC
const t = initTRPC.create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Input validation schemas
export const audioStreamSchema = z.object({
  audioChunk: z.instanceof(ArrayBuffer),
  sampleRate: z.number().min(8000).max(48000),
  channels: z.number().min(1).max(2),
  timestamp: z.number(),
  videoId: z.string().optional()
});

export const videoIdSchema = z.object({
  videoId: z.string().min(11).max(11) // YouTube video IDs are 11 characters
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const audioAnalysisSchema = z.object({
  videoId: z.string().min(11).max(11),
  summary: z.string().min(1),
  transcript: z.string().min(1),
  duration: z.number().min(0),
  confidence: z.number().min(0).max(1)
});

// Type exports for use in other packages
export type AudioStreamInput = z.infer<typeof audioStreamSchema>;
export type VideoIdInput = z.infer<typeof videoIdSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type AudioAnalysisInput = z.infer<typeof audioAnalysisSchema>;
