import { GoogleGenAI } from "@google/genai";

export async function stepSummarizeWithGoogleGenAI(
  submissionId: string,
  bucket: R2Bucket,
  title: string,
  author: string,
  captions: string,
  googleAiApiToken: string
) {
  const ai = new GoogleGenAI({
    apiKey: googleAiApiToken,
  });
  console.log("step:summarize video caption", {
    title: title,
    author: author,
    // not very satisfying, but I could not find a better way to access the token
    // because we can't declare the workers secret in the wrangler.jsonc file
    googleAiApiToken: googleAiApiToken.substring(0, 10),
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize the following video caption for "${title}" by ${author}:\n\n${captions}`,
  });

  // write response to r2 bucket
  const key = `submissions/${submissionId}/llm_response.json`;
  await bucket.put(key, JSON.stringify(response, null, 2), {
    httpMetadata: {
      contentType: "application/json",
    },
  });

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
