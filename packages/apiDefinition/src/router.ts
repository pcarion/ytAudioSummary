// Zod Schemas and Types for API Definition

import { z } from "zod";

// Input schemas
export const submitContentInput = z.object({
	url: z.string().url(),
	title: z.string(),
	domain: z.string(),
	pathName: z.string(),
	youtubeVideo: z
		.object({
			videoId: z.string(),
			title: z.string(),
			author: z.string(),
			shortDescription: z.string(),
			captions: z.string(),
			isLiveContent: z.boolean(),
			lengthSeconds: z.string(),
			channelId: z.string(),
			thumbnails: z.array(
				z.object({
					url: z.string(),
					width: z.number(),
					height: z.number(),
				})
			),
		})
		.optional(),
	metadata: z.array(
		z.object({
			name: z.string(),
			value: z.string(),
		})
	),
	sender: z.object({
		appName: z.string(),
		appVersion: z.string(),
		timestamp: z.string(),
		osName: z.string(),
		userAgent: z.string(),
	}),
});

export const execSubmissionInput = z.object({
	submissionId: z.string(),
});

export const cancelSubmissionInput = z.object({
	submissionId: z.string(),
});

// Response schemas
export const submitContentResponse = z.object({
	success: z.boolean(),
	submissionId: z.string(),
	submissionType: z.string(),
	submissionUrl: z.string(),
	submissionTitle: z.string(),
	message: z.string(),
	credits: z.object({
		current: z.number(),
		creditsCost: z.number(),
	}),
});

export const execSubmissionResponse = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const cancelSubmissionResponse = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const getMeResponse = z.object({
	information: z.object({
		rssUrlPath: z.string(),
	}),
	lastSubmissions: z.array(
		z.object({
			submissionId: z.string(),
			date: z.string(),
			approvalStatus: z.enum(["notConfirmed", "confirmed", "rejected"]),
			submissionStatus: z.enum([
				"pending",
				"processing",
				"completed",
				"failed",
			]),
			url: z.string(),
			title: z.string(),
		})
	),
	feedContents: z.array(
		z.object({
			contentId: z.string(),
			title: z.string(),
			author: z.string(),
			pathToAudio: z.string(),
			pathToImage: z.string(),
			originalContentUrl: z.string(),
		})
	),
	messages: z.array(
		z.object({
			message: z.string(),
			type: z.string(),
			createdAt: z.string(),
		})
	),
});
