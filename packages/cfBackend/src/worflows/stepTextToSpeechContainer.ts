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
      submissionId: submissionId,
      r2BucketName: bucket.bucketName,
      r2AccessKeyId: bucket.accessKeyId,
      r2SecretAccessKey: bucket.secretAccessKey,
      r2Prefix: bucket.prefix,
      r2AccountId: bucket.accountId,
    });
    console.log("Sending request to container...");
    const result = await container.fetch(
      new Request("http://container/process", {
        method: "POST",
        body: body,
      })
    );
    console.log("Response from container:");
    if (!result.ok) {
      const text = await result.text();
      const status = result.status;
      const statusText = result.statusText;
      console.error(
        "Failed to process text to speech",
        text,
        status,
        statusText
      );
      throw new Error("Failed to process text to speech");
    }
    const json = await result.json();
    const jsonAny = json as any;
    const r = {
      response: json,
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
      url: result.url,
      ok: result.ok,
      redirected: result.redirected,
      cf: result.cf,
      r2Key: jsonAny.r2Key,
    };
    console.log("response is:", JSON.stringify(r, null, 2));
    return r;
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
