/**
 * YouTube Audio Summary API - Cloudflare Workers Backend
 *
 * This worker serves the tRPC API for the YouTube Audio Summary application.
 * It provides endpoints for content submission, user management, and feed operations.
 *
 * - Run `npm run dev` to start a development server
 * - Run `npm run deploy` to publish to Cloudflare Workers
 * - API endpoints are available at /trpc/*
 * - Health check available at /health
 */

import app from "./trpc";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
