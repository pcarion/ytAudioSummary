// Import the Workflow definition
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { getSubmissionById } from "../router/r2-utils";

export interface SubmissionWorkflowParams {
  submissionId: string;
}

interface VideoInformation {
  title: string;
  author: string;
  captions: string;
}

// Create your own class that implements a Workflow
export class SubmissionWorkflow extends WorkflowEntrypoint<
  Env,
  SubmissionWorkflowParams
> {
  // Define a run() method
  async run(
    event: WorkflowEvent<SubmissionWorkflowParams>,
    step: WorkflowStep
  ) {
    // Define one or more steps that optionally return state.
    // Can access bindings on `this.env`
    // Can access params on `event.payload`
    const videoInformation: VideoInformation = await step.do(
      "retrieve submission",
      async () => {
        // retrieve record from r2 bucket
        const submission = await getSubmissionById(
          this.env.YT_AUDIO_SUMMARY_BUCKET,
          event.payload.submissionId
        );
        // get usefull data from submission
        if (!submission) {
          throw new Error(
            "Submission not found in R2 bucket: " + event.payload.submissionId
          );
        }

        // we are interested in the youtubeVideo data
        const { youtubeVideo } = submission;
        if (!youtubeVideo) {
          throw new Error(
            "Youtube video data not found in submission: " +
              event.payload.submissionId
          );
        }
        const { title, author, captions } = youtubeVideo;

        // we are interested in the captions data
        if (!captions) {
          throw new Error(
            "Captions data not found in submission: " +
              event.payload.submissionId
          );
        }
        return {
          title,
          author,
          captions,
        };
      }
    );

    await step.do("summarize video caption", async () => {
      console.log("summarize video caption", {
        title: videoInformation.title,
        author: videoInformation.author,
        // not very satisfying, but I could not find a better way to access the token
        // because we can't declare the workers secret in the wrangler.jsonc file
        token: (this.env as any).CF_AI_GATEWAY_TOKEN,
      });
    });
  }
}
