import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";

export async function step04TextToSpeechElevenLabs(
  submissionId: string,
  inputText: string,
  elevenLabsApiToken: string,
  bucket: R2Bucket
) {
  const client = new ElevenLabsClient({ apiKey: elevenLabsApiToken });
  const voiceId = "Xb7hH8MSUJpSbSDYk0k2";

  const audio = await client.textToSpeech.convert(voiceId, {
    text: inputText,
    modelId: "eleven_multilingual_v2",
  });

  // store audio to r2 bucket
  const fileName = `submissions/${submissionId}/tts.mp3`;
  const storedAudio = await bucket.put(fileName, audio, {
    httpMetadata: {
      contentType: "audio/mpeg",
    },
  });

  return {
    fileName,
    mimeType: "audio/mpeg",
    size: storedAudio.size,
    textLength: inputText.length,
    voiceName: voiceId,
  };
}
