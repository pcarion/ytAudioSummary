import { GoogleGenAI } from "@google/genai";

export async function stepTextToSpeechGoogleGenAI(
  submissionId: string,
  inputText: string,
  voiceName: string,
  googleAiApiToken: string,
  bucket: R2Bucket
) {
  const cleanSummary = cleanupText(inputText);
  // write clean summary to r2 bucket
  const key = `submissions/${submissionId}/clean_summary.txt`;
  await bucket.put(key, cleanSummary, {
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

  const response = await ai.models.generateContent({
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
  console.log("TTS response structure", {
    candidates: response.candidates?.length || 0,
    hasContent: !!response.candidates?.[0]?.content,
    hasParts: !!response.candidates?.[0]?.content?.parts,
    partsLength: response.candidates?.[0]?.content?.parts?.length || 0,
    hasInlineData: !!response.candidates?.[0]?.content?.parts?.[0]?.inlineData,
  });

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

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
  await bucket.put(fileName, wavBuffer, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=3600",
    },
  });

  return {
    fileName,
    mimeType,
    size: wavBuffer.length,
    textLength: inputText.length,
    voiceName,
  };
}

// replace characters like \n, \r, \t, * _ - etc. and trim the text
export function cleanupText(text: string) {
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
