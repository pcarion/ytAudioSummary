// tRPC Middleware

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC
const t = initTRPC.create();

// Context type definition
export interface Context {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
  requestId: string;
  timestamp: Date;
}

// Create context from request
export const createContext = async (): Promise<Context> => {
  return {
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
};

// Middleware for logging
export const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  
  console.log(`[${(ctx as Context).timestamp.toISOString()}] ${type} ${path} - Request ID: ${(ctx as Context).requestId}`);
  
  const result = await next();
  
  const duration = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${type} ${path} completed in ${duration}ms`);
  
  return result;
});

// Middleware for authentication (optional)
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // In a real implementation, you would verify JWT tokens, API keys, etc.
  // For now, we'll allow all requests
  if (!(ctx as Context).user) {
    console.log(`Unauthenticated request: ${(ctx as Context).requestId}`);
  }
  
  return next({
    ctx: {
      ...ctx,
      user: (ctx as Context).user
    }
  });
});

// Export middleware
export const middleware = {
  logging: loggingMiddleware,
  auth: authMiddleware,
};
