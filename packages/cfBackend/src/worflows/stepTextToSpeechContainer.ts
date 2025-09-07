/// <reference path="../../worker-configuration.d.ts" />
import { TextToSpeechContainer } from "../containers/TextToSpeechContainer";

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
export async function stepTextToSpeechContainer(
  submissionId: string,
  cleanSummary: string,
  elevenLabsApiToken: string,
  bucket: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    prefix: string;
    accountId: string;
  },
  container: DurableObjectStub<TextToSpeechContainer>
) {
  const tries = 10;
  await container.init();

  const waitUntilContainerIsOk = async () => {
    let lastErr: unknown;
    for (let i = 0; i < tries; i++) {
      console.log("checking health ok #", i + 1);
      try {
        await container.health();
        return;
      } catch (err) {
        console.error(
          "transient error:",
          err instanceof Error ? err.message : JSON.stringify(err)
        );
        await sleep(500);
        lastErr = err;
      }
    }

    throw lastErr;
  };

  console.log("Waiting for container to be ok");
  await waitUntilContainerIsOk();
  console.log("Container is ok");

  try {
    const body = JSON.stringify({
      text: cleanSummary,
      elevenLabsApiToken: elevenLabsApiToken,
      r2BucketName: bucket.bucketName,
      r2AccessKeyId: bucket.accessKeyId,
      r2SecretAccessKey: bucket.secretAccessKey,
      r2Prefix: bucket.prefix,
      r2AccountId: bucket.accountId,
    });
    console.log("Sending request to container...");
    const result = await container.processSubmission(submissionId, body);
    console.log("Response from container:");
    if (!result.ok) {
      const text = await result.text();
      const status = result.status;
      const statusText = result.statusText;
      console.error(
        "Failed to start text to speech processing",
        text,
        status,
        statusText
      );
      throw new Error("Failed to start text to speech processing");
    }

    const json = await result.json();
    console.log("Processing started, response:", JSON.stringify(json, null, 2));

    // Poll for completion
    const maxPollingAttempts = 60; // 5 minutes with 5-second intervals
    const pollingInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxPollingAttempts; attempt++) {
      console.log(
        `Checking status (attempt ${attempt + 1}/${maxPollingAttempts})...`
      );

      const statusResult = await container.getSubmissionStatus(submissionId);

      if (!statusResult.ok) {
        console.error(
          "Failed to check status:",
          statusResult.status,
          statusResult.statusText
        );
        await sleep(pollingInterval);
        continue;
      }

      const statusJson = await statusResult.json();
      console.log("Status response:", JSON.stringify(statusJson, null, 2));
      const statusJsonTyped = statusJson as {
        status: string;
        r2Key: string;
        error: string;
      };

      if (statusJsonTyped.status === "completed") {
        console.log("Processing completed successfully!");
        const r = {
          response: statusJson,
          status: statusResult.status,
          statusText: statusResult.statusText,
          headers: statusResult.headers,
          url: statusResult.url,
          ok: statusResult.ok,
          redirected: statusResult.redirected,
          cf: statusResult.cf,
          r2Key: statusJsonTyped.r2Key,
        };
        return r;
      } else if (statusJsonTyped.status === "failed") {
        console.error("Processing failed:", statusJsonTyped.error);
        throw new Error(
          `Text to speech processing failed: ${statusJsonTyped.error}`
        );
      }

      // Still processing, wait and try again
      console.log("Still processing, waiting...");
      await sleep(pollingInterval);
    }

    throw new Error("Text to speech processing timed out");
  } catch (err) {
    console.error(
      "There was an error processing the text to speech",
      err instanceof Error ? err.message : JSON.stringify(err)
    );
    throw err;
  }
  //   await container.destroy();
  //   console.log("Container destroyed");
}
