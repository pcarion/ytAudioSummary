// Import the Workflow definition
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { stepRetrieveSubmissionFromR2 } from "./stepRetrieveSubmission";
import { stepSummarizeWithGoogleGenAI } from "./stepSummarize";
import { stepTextToSpeechGoogleGenAI } from "./stepTextToSpeech";

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
      const submissionId = event.payload.submissionId;
      const voiceName = "kore";

      const googleAiApiToken = (this.env as any).GOOGLEAI_API_KEY;
      if (!googleAiApiToken) {
        throw new Error("GOOGLEAI_API_KEY is not set");
      }

      // Define one or more steps that optionally return state.
      // Can access bindings on `this.env`
      // Can access params on `event.payload`
      const videoInformation: VideoInformation = await step.do(
        "retrieve submission",
        async () => {
          const submission = await stepRetrieveSubmissionFromR2(
            submissionId,
            this.env.YT_AUDIO_SUMMARY_BUCKET
          );
          return submission;
        }
      );

      const summarizationInformatiom = await step.do(
        "summarize video caption",
        {
          retries: {
            limit: 0,
            delay: 1000,
            backoff: "exponential",
          },
        },
        async () => {
          const summarizationInformatiom = await stepSummarizeWithGoogleGenAI(
            submissionId,
            this.env.YT_AUDIO_SUMMARY_BUCKET,
            videoInformation.title,
            videoInformation.author,
            videoInformation.captions,
            googleAiApiToken
          );
          return summarizationInformatiom;
        }
      );

      const finalSummary = await step.do(
        "summary text to speech",
        {
          retries: {
            limit: 0,
            delay: 1000,
            backoff: "exponential",
          },
        },
        async () => {
          const ttsInformation = await stepTextToSpeechGoogleGenAI(
            submissionId,
            summarizationInformatiom.summary,
            voiceName,
            googleAiApiToken,
            this.env.YT_AUDIO_SUMMARY_BUCKET
          );
          return ttsInformation;
        }
      );

      return `Summary (elevenlabs): ${videoInformation.title}:${finalSummary.fileName}`;
    } catch (workflowError: any) {
      // Critical: Log the full error details
      console.error("=== WORKFLOW EXECUTION FAILED ===");
      console.error("Error name:", workflowError.name);
      console.error("Error message:", workflowError.message);
      console.error("Error stack:", workflowError.stack);
      console.error("Error cause:", workflowError.cause);
      console.error(
        "Full error object:",
        JSON.stringify(workflowError, Object.getOwnPropertyNames(workflowError))
      );

      // Important: Re-throw with a clear message
      throw new Error(`SubmissionWorkflow failed: ${workflowError.message}`);
    }
  }
}
