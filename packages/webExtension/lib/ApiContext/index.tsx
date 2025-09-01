import React, { createContext, useContext, type ReactNode } from "react";
import { z } from "zod";
import type { HttpApiSubmitContentBody } from "./types/httpContentSubmission/HttpApiSubmitContentBody";
import type { HttpApiSubmitContentResponse } from "./types/httpContentSubmission/HttpApiSubmitContentResponse";
import type { HttpApiExecSubmissionBody } from "./types/httpContentSubmission/HttpApiExecSubmissionBody";
import type { HttpApiExecSubmissionResponse } from "./types/httpContentSubmission/HttpApiExecSubmissionResponse";
import type { HttpApiCancelSubmissionBody } from "./types/httpContentSubmission/HttpApiCancelSubmissionBody";
import type { HttpApiCancelSubmissionResponse } from "./types/httpContentSubmission/HttpApiCancelSubmissionResponse";
import { HttpApiSubmitContentResponseSchema } from "./types/httpContentSubmission/HttpApiSubmitContentResponseSchema";
import { HttpApiExecSubmissionResponseSchema } from "./types/httpContentSubmission/HttpApiExecSubmissionResponseSchema";
import { HttpApiCancelSubmissionResponseSchema } from "./types/httpContentSubmission/HttpApiCancelSubmissionResponseSchema";
import type { HttpApiGetMeResponse } from "./types/httpUserApi/HttpApiGetMeResponse";
import { HttpApiGetMeResponseSchema } from "./types/httpUserApi/HttpApiGetMeResponseSchema";

const apiCallEnvelopeSchema = z.object({
  now: z.string(),
  payload: z.any(),
});

const apiUrl = "";
const apiAccessToken = "";

interface ApiContextType {
  submitContent: (
    submissionBody: HttpApiSubmitContentBody
  ) => Promise<HttpApiSubmitContentResponse>;
  approveSubmission: (
    submissionBody: HttpApiExecSubmissionBody
  ) => Promise<HttpApiExecSubmissionResponse>;
  cancelSubmission: (
    submissionBody: HttpApiCancelSubmissionBody
  ) => Promise<HttpApiCancelSubmissionResponse>;
  getMe: () => Promise<HttpApiGetMeResponse>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const makeApiRequest = async <T extends z.ZodType>(
    endpoint: string,
    body: unknown,
    responseSchema: T
  ): Promise<z.infer<T>> => {
    const method = body === null ? "GET" : "POST";
    if (!apiUrl) {
      throw new Error("API URL not found");
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiAccessToken) {
      headers.Authorization = `Bearer ${apiAccessToken}`;
    }

    console.log(">http>apiUrl", apiUrl);
    console.log(">http>endpoint", endpoint);
    console.log(
      ">http>headers>accessToken",
      headers,
      (apiAccessToken || "").substring(0, 10),
      "..."
    );
    console.log(">http>method", method);
    console.log(">http>body", body);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      body: method === "POST" ? JSON.stringify(body) : null,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    // check if the response is a valid apiCallEnvelope
    const responseEnvelope = await response.json();
    const parsedEnvelope = apiCallEnvelopeSchema.safeParse(responseEnvelope);
    if (!parsedEnvelope.success) {
      throw new Error("Invalid API response envelope");
    }

    const payload = parsedEnvelope.data.payload;

    // Validate the payload against the provided schema
    const parsedPayload = responseSchema.safeParse(payload);
    if (!parsedPayload.success) {
      throw new Error("Invalid API response payload");
    }

    console.log(">http>response>payload", parsedPayload.data);

    return parsedPayload.data;
  };

  const submitContent = async (
    submissionBody: HttpApiSubmitContentBody
  ): Promise<HttpApiSubmitContentResponse> => {
    console.log("Submitting content to:", apiUrl);
    console.log("Submission body:", submissionBody);

    return makeApiRequest(
      "/api/content/submit",
      submissionBody,
      HttpApiSubmitContentResponseSchema
    );
  };

  const approveSubmission = async (
    submissionBody: HttpApiExecSubmissionBody
  ): Promise<HttpApiExecSubmissionResponse> => {
    console.log("Approving submission to:", apiUrl);
    console.log("Submission body:", submissionBody);

    return makeApiRequest(
      "/api/content/exec",
      submissionBody,
      HttpApiExecSubmissionResponseSchema
    );
  };

  const cancelSubmission = async (
    submissionBody: HttpApiCancelSubmissionBody
  ): Promise<HttpApiCancelSubmissionResponse> => {
    console.log("Canceling submission to:", apiUrl);
    console.log("Submission body:", submissionBody);

    return makeApiRequest(
      "/api/content/cancel",
      submissionBody,
      HttpApiCancelSubmissionResponseSchema
    );
  };

  const getMe = async (): Promise<HttpApiGetMeResponse> => {
    return makeApiRequest("/api/user/me", null, HttpApiGetMeResponseSchema);
  };

  const value = {
    submitContent,
    approveSubmission,
    cancelSubmission,
    getMe,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
