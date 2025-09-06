# AI SDKs

AI Gateway:
https://developers.cloudflare.com/ai-gateway/get-started/

List of providers:
https://developers.cloudflare.com/ai-gateway/usage/providers/

For instance, Google AI:
https://developers.cloudflare.com/ai-gateway/usage/providers/google-ai-studio/

Google gemini ai documentation:
https://ai.google.dev/gemini-api/docs


to convert output from google ai tts to wav:

```
ffmpeg -f s16le -ar 24000 -i raw_audio.pcm -acodec pcm_s16le output.wav
```

dashboard:

https://aistudio.google.com/usage?project=gen-lang-client-0560679238




# database / drizzle commands

## Available Commands

```bash
# Setup environment (copies .env.example to .env)
pnpm db:setup

# Check configuration
pnpm db:check

# Generate migrations
pnpm db:generate

# Apply migrations to D1
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Drop database (use with caution)
pnpm db:drop
```
