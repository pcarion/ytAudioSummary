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
          // retrieve record from r2 bucket
          const submission = await getSubmissionById(
            this.env.YT_AUDIO_SUMMARY_BUCKET,
            submissionId
          );
          // get usefull data from submission
          if (!submission) {
            throw new Error(
              "Submission not found in R2 bucket: " + submissionId
            );
          }

          // we are interested in the youtubeVideo data
          const { youtubeVideo } = submission;
          if (!youtubeVideo) {
            throw new Error(
              "Youtube video data not found in submission: " + submissionId
            );
          }
          const { title, author, captions } = youtubeVideo;

          // we are interested in the captions data
          if (!captions) {
            throw new Error(
              "Captions data not found in submission: " + submissionId
            );
          }
          return {
            title,
            author,
            captions,
          };
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

          // write response to r2 bucket
          const key = `submissions/${submissionId}/llm_response.json`;
          await this.env.YT_AUDIO_SUMMARY_BUCKET.put(
            key,
            JSON.stringify(response, null, 2),
            {
              httpMetadata: {
                contentType: "application/json",
              },
            }
          );

          console.log("response", JSON.stringify(response, null, 2));
          const summary =
            response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No summary generated";
          console.log("summary", { summary });

          // Return only serializable data
          return {
            summary: summary,
            model: response.modelVersion || "unknown",
            finishReason: response.candidates?.[0]?.finishReason,
            usage: response.usageMetadata,
          };
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
          // Add timeout wrapper for TTS generation
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("TTS generation timeout")),
              900000
            ); // 15 minutes timeout
          });
          const summary = summarizationInformatiom.summary;
          const cleanSummary = cleanupText(summary);
          // write clean summary to r2 bucket
          const key = `submissions/${submissionId}/clean_summary.txt`;
          await this.env.YT_AUDIO_SUMMARY_BUCKET.put(key, cleanSummary, {
            httpMetadata: {
              contentType: "text/plain",
            },
          });

          // generate text to speech
          const ai = new GoogleGenAI({
            apiKey: googleAiApiToken,
          });

          //https://ai.google.dev/gemini-api/docs/speech-generation
          console.log("Generating TTS for text", {
            textLength: cleanSummary.length,
            voiceName,
            textPreview: cleanSummary.substring(0, 100) + "...",
          });

          console.log("Processing TTS with text length:", cleanSummary.length);

          const ttsGeneration = async () => {
            let response;
            try {
              response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [
                  {
                    parts: [
                      {
                        text: `Read aloud in a warm, welcoming tone: ${cleanSummary}`,
                      },
                    ],
                  },
                ],
                config: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                  },
                },
              });
            } catch (error: any) {
              console.error("TTS generation failed:", {
                error: error.message,
                code: error.code,
                status: error.status,
                cleanSummaryLength: cleanSummary.length,
                summaryLength: summary.length,
              });

              throw error;
            }
            return response;
          };

          const response = (await Promise.race([
            ttsGeneration(),
            timeoutPromise,
          ])) as any;

          console.log("TTS response structure", {
            candidates: response.candidates?.length || 0,
            hasContent: !!response.candidates?.[0]?.content,
            hasParts: !!response.candidates?.[0]?.content?.parts,
            partsLength: response.candidates?.[0]?.content?.parts?.length || 0,
            hasInlineData:
              !!response.candidates?.[0]?.content?.parts?.[0]?.inlineData,
          });

          const inlineData =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

          if (!inlineData) {
            throw new Error("No audio data received from AI (1)");
          }

          if (!inlineData.data) {
            throw new Error("No audio data received from AI (2)");
          }

          console.log("Audio data info", {
            mimeType: inlineData.mimeType,
            dataLength: inlineData.data?.length || 0,
          });

          const pcmData = Uint8Array.from(atob(inlineData.data), (c) =>
            c.charCodeAt(0)
          );
          const wavHeader = createWavHeader(pcmData.length);
          const wavBuffer = new Uint8Array(wavHeader.length + pcmData.length);
          wavBuffer.set(wavHeader, 0);
          wavBuffer.set(pcmData, wavHeader.length);

          // Use the mimeType from the response or default to audio/wav
          const mimeType = "audio/wav";
          const fileExtension = "wav";
          const fileName = `submissions/${submissionId}/tts.${fileExtension}`;

          console.log("Uploading audio file", {
            fileName,
            mimeType,
            size: wavBuffer.length,
          });

          // Upload to R2
          await this.env.YT_AUDIO_SUMMARY_BUCKET.put(fileName, wavBuffer, {
            httpMetadata: {
              contentType: mimeType,
              cacheControl: "public, max-age=3600",
            },
          });

          return cleanSummary;
        }
      );

      return `Summary: ${videoInformation.title}:${finalSummary.substring(
        0,
        20
      )}...`;
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

// replace characters like \n, \r, \t, * _ - etc. and trim the text
function cleanupText(text: string) {
  return text
    .replace(/[\n\r\t\*_\-\+\[\]\(\)\{\}\.\?!]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// A helper function to create a WAV header for raw PCM data
function createWavHeader(
  dataLength: number,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const pcmDataSize = dataLength;
  const fileSize = pcmDataSize + 36; // 44-byte header - 8 bytes for RIFF chunk

  // RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, fileSize, true);
  writeString(8, "WAVE");

  // fmt chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  view.setUint32(28, byteRate, true);
  const blockAlign = numChannels * (bitsPerSample / 8);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(36, "data");
  view.setUint32(40, pcmDataSize, true);

  return new Uint8Array(buffer);
}
