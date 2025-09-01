import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { appRouter as AppRouter } from "@yt-audio-summary/cf-backend/src/router";

// Create tRPC client
export function createApiClient(apiUrl: string, apiToken?: string) {
	return createTRPCClient<typeof AppRouter>({
		links: [
			httpBatchLink({
				url: `${apiUrl}/trpc`,
				headers: () => {
					const headers: Record<string, string> = {};
					if (apiToken) {
						headers.Authorization = `Bearer ${apiToken}`;
					}
					return headers;
				},
			}),
		],
	});
}

export type ApiClient = ReturnType<typeof createApiClient>;
