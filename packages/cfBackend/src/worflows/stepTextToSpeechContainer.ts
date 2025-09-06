/// <reference path="../../worker-configuration.d.ts" />
import { TextToSpeechContainer } from "../containers/TextToSpeechContainer";

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
export async function stepTextToSpeechContainer(
  submissionId: string,
  inputText: string,
  voiceName: string,
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
      text: inputText,
      voiceName: voiceName,
      submissionId: submissionId,
    });
    console.log("Sending request to container...");
    const result = await container.fetch(
      new Request("http://container/process", {
        method: "POST",
        body: body,
      })
    );
    console.log("Response from container:");
    console.log(JSON.stringify(result, null, 2));
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
