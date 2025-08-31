// Cloudflare Workers Backend - Main Entry Point
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
// import { appRouter } from '@yt-audio-summary/api-definition';
// import { createContext } from '@yt-audio-summary/api-definition';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'YouTube Audio Summary API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// tRPC endpoint - commented out for now as it requires additional setup
// app.use('/trpc/*', trpcServer({
//   router: appRouter,
//   createContext: createContext
// }));

// REST API endpoints (alternative to tRPC)
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: (c.env as any)?.ENVIRONMENT || 'development'
  });
});

app.get('/api/analyses', async (c) => {
  try {
    // Mock data for now
    const analyses = [
      {
        id: '1',
        videoId: 'sample_video_1',
        summary: 'Sample audio summary',
        transcript: 'Sample transcript',
        duration: 120.5,
        processedAt: new Date().toISOString(),
        confidence: 0.92
      }
    ];
    
    return c.json({
      success: true,
      data: analyses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    timestamp: new Date().toISOString()
  }, 404);
});

export default app;
