// Import the Workflow definition
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

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
          const aiUnifiedUrl = `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/${GatewayId}/compat`;
          const cfAigToken = (this.env as any).CF_AI_GATEWAY_TOKEN;
          const googleAiApiToken = (this.env as any).GOOGLEAI_API_KEY;
          console.log("step:summarize video caption", {
            title: videoInformation.title,
            author: videoInformation.author,
            // not very satisfying, but I could not find a better way to access the token
            // because we can't declare the workers secret in the wrangler.jsonc file
            cfAigToken: cfAigToken.substring(0, 10),
            googleAiApiToken: googleAiApiToken.substring(0, 10),
            aiUnifiedUrl,
          });

          // const google = createGoogleGenerativeAI({
          //   baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/${GatewayId}/google-ai-studio/v1beta`,
          // });

          // const google = createGoogleGenerativeAI({
          //   baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/${GatewayId}/google-ai-studio/v1beta`,
          //   apiKey: googleAiApiToken,
          //   headers: {
          //     "cf-aig-authorization": `Bearer ${cfAigToken}`,
          //   },
          // });

          const google = createGoogleGenerativeAI({
            apiKey: googleAiApiToken,
          });

          const response = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: `Summarize the following video caption for "${videoInformation.title}" by ${videoInformation.author}:\n\n${videoInformation.captions}`,
          });

          console.log("response", JSON.stringify(response, null, 2));

          // // Truncate captions if too long (most models have token limits)
          // const maxCaptionLength = 50000; // Adjust based on model limits
          // const truncatedCaptions =
          //   videoInformation.captions.length > maxCaptionLength
          //     ? videoInformation.captions.substring(0, maxCaptionLength) + "..."
          //     : videoInformation.captions;

          // const requestBody = {
          //   model: "google-ai-studio/gemini-2.0-flash",
          //   messages: [
          //     {
          //       role: "user",
          //       content: `Summarize the following video caption for "${videoInformation.title}" by ${videoInformation.author}:\n\n${truncatedCaptions}`,
          //     },
          //   ],
          // };

          // console.log("Request details", {
          //   url: aiUnifiedUrl,
          //   bodyLength: JSON.stringify(requestBody).length,
          //   captionLength: videoInformation.captions.length,
          //   truncatedCaptionLength: truncatedCaptions.length,
          // });

          // const response = await fetch(aiUnifiedUrl, {
          //   method: "POST",
          //   headers: {
          //     "cf-aig-authorization": `Bearer ${cfAigToken}`,
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify(requestBody),
          // });

          // if (!response.ok) {
          //   const errorText = await response.text();
          //   console.error("AI Gateway request failed", {
          //     status: response.status,
          //     statusText: response.statusText,
          //     headers: Object.fromEntries(response.headers.entries()),
          //     body: errorText,
          //     requestUrl: aiUnifiedUrl,
          //     requestBody: JSON.stringify(requestBody, null, 2),
          //   });
          //   throw new Error(
          //     `AI Gateway request failed: ${response.status} ${response.statusText} - ${errorText}`
          //   );
          // }

          // const completion = await response.json();
          // console.log("completion", JSON.stringify(completion, null, 2));
        }
      );
    } catch (error) {
      console.error("Error in SubmissionWorkflow", error);
      throw error;
    }
  }
}
