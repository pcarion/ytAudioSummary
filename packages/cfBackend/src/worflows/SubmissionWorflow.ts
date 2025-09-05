// Import the Workflow definition
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { GoogleGenAI } from "@google/genai";
import { getSubmissionById } from "../router/r2-utils";

export interface SubmissionWorkflowParams {
  submissionId: string;
}

interface VideoInformation {
  title: string;
  author: string;
  captions: string;
}

const GatewayId = "yt-audio-summary";

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
    try {
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

      await step.do(
        "summarize video caption",
        {
          retries: {
            limit: 0,
            delay: 1000,
            backoff: "exponential",
          },
        },
        async () => {
          const googleAiApiToken = (this.env as any).GOOGLEAI_API_KEY;
          const ai = new GoogleGenAI({
            apiKey: googleAiApiToken,
          });
          console.log("step:summarize video caption", {
            title: videoInformation.title,
            author: videoInformation.author,
            // not very satisfying, but I could not find a better way to access the token
            // because we can't declare the workers secret in the wrangler.jsonc file
            googleAiApiToken: googleAiApiToken.substring(0, 10),
          });

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following video caption for "${videoInformation.title}" by ${videoInformation.author}:\n\n${videoInformation.captions}`,
          });

          console.log("response", JSON.stringify(response, null, 2));
          const summary =
            response.candidates?.[0]?.content || "No summary generated";
          console.log("summary", summary);
          return summary;
        }
      );
    } catch (error) {
      console.error("Error in SubmissionWorkflow", error);
      throw error;
    }
  }
}
