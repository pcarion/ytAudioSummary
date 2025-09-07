// Import the Workflow definition
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { stepRetrieveSubmissionFromR2 } from "./stepRetrieveSubmission";
import { stepSummarizeWithGoogleGenAI } from "./stepSummarize";
import { stepTextToSpeechContainer } from "./stepTextToSpeechContainer";
import { stepUpdateFeedTable } from "./stepUpdateFeedTable";
import { TextToSpeechContainer } from "../containers/TextToSpeechContainer";
import { DatabaseService } from "../db/queries";

export interface SubmissionWorkflowParams {
  submissionId: string;
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

      const accountId = this.env.CF_ACCOUNT_ID;
      if (!accountId) {
        throw new Error("CF_ACCOUNT_ID is not set");
      }

      const googleAiApiToken = (this.env as any).GOOGLEAI_API_KEY;
      if (!googleAiApiToken) {
        throw new Error("GOOGLEAI_API_KEY is not set");
      }

      const elevenLabsApiToken = (this.env as any).ELEVENLABS_API_KEY;
      if (!elevenLabsApiToken) {
        throw new Error("ELEVENLABS_API_KEY is not set");
      }

      const publicAccessKeyId = (this.env as any).R2_PUBLIC_ACCESS_KEY_ID;
      if (!publicAccessKeyId) {
        throw new Error("R2_PUBLIC_ACCESS_KEY_ID is not set");
      }
      const publicSecretAccessKey = (this.env as any)
        .R2_PUBLIC_SECRET_ACCESS_KEY;
      if (!publicSecretAccessKey) {
        throw new Error("R2_PUBLIC_SECRET_ACCESS_KEY is not set");
      }

      const publicBucketName = (this.env as any).R2_PUBLIC_BUCKET_NAME;
      if (!publicBucketName) {
        throw new Error("R2_PUBLIC_BUCKET_NAME is not set");
      }

      const container = this.env.TEXT_TO_SPEECH_CONTAINER.get(
        this.env.TEXT_TO_SPEECH_CONTAINER.idFromName(event.instanceId)
      );
      if (!container) {
        throw new Error("TEXT_TO_SPEECH_CONTAINER is not set");
      }

      const db = new DatabaseService(this.env.YT_AUDIO_SUMMARY_DB);

      // Define one or more steps that optionally return state.
      // Can access bindings on `this.env`
      // Can access params on `event.payload`
      const videoInformation = await step.do(
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

      // call text to speech container
      const ttsInformation = await step.do(
        "text to speech container",
        {
          retries: {
            limit: 0,
            delay: 1000,
            backoff: "exponential",
          },
        },
        async () => {
          console.log("Calling text to speech container");
          const prefix = `rss_audios/${submissionId}`;
          const r = await stepTextToSpeechContainer(
            submissionId,
            summarizationInformatiom.cleanedSummary,
            elevenLabsApiToken,
            {
              accessKeyId: publicAccessKeyId,
              secretAccessKey: publicSecretAccessKey,
              bucketName: publicBucketName,
              prefix: prefix,
              accountId: accountId,
            },
            container as DurableObjectStub<TextToSpeechContainer>
          );
          // Return only serializable data
          return {
            r2Key: r.r2Key,
            status: r.status,
            statusText: r.statusText,
            ok: r.ok,
            redirected: r.redirected,
            url: r.url,
            // Convert Headers to plain object
            headers: Object.fromEntries(r.headers.entries()),
            // Convert response to serializable format
            response:
              typeof r.response === "string"
                ? r.response
                : JSON.stringify(r.response),
          };
        }
      );

      const feedId = await step.do(
        "update feed table",
        {
          retries: {
            limit: 3,
            delay: 1000,
            backoff: "exponential",
          },
        },
        async () => {
          return await stepUpdateFeedTable(db, submissionId, {
            url: videoInformation.url,
            title: videoInformation.title,
            summaryText: summarizationInformatiom.cleanedSummary,
            r2Key: ttsInformation.r2Key,
            thumbnailUrl: videoInformation.thumbnailUrl,
          });
        }
      );

      return `Summary (elevenlabs): ${videoInformation.title}:feedId:${feedId}`;
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
