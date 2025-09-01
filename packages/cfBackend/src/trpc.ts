import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@yt-audio-summary/api-definition";

// Create Hono app
const app = new Hono();

// Add tRPC handler
app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({}),
  });
});

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date() }));

export default app;
