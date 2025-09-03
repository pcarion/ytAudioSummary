/// <reference path="../worker-configuration.d.ts" />
import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, type Context } from "./router";

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Add tRPC handler
app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (): Context => ({
      env: c.env,
    }),
  });
});

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date() }));

export default app;
