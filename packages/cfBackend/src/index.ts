/// <reference path="../worker-configuration.d.ts" />
import app from "./trpc";

// Export the Workflow
export {
  SubmissionWorkflow,
  type SubmissionWorkflowParams,
} from "./worflows/SubmissionWorflow";

// Export the TextToSpeechContainer
export { TextToSpeechContainer } from "./containers/TextToSpeechContainer";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
