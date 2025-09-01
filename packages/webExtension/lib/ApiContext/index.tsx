import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createApiClient } from "../trpc/client";
import type { AppRouter } from "@yt-audio-summary/api-definition";

// keys to store the auth settings in the browser storage
const STORAGE_API_TOKEN_KEY = "apiToken";
const STORAGE_API_URL_KEY = "apiUrl";

interface ApiSettings {
  apiUrl: string;
  apiToken: string;
}

interface ApiContextType {
  submitContent: AppRouter["submitContent"];
  approveSubmission: AppRouter["approveSubmission"];
  cancelSubmission: AppRouter["cancelSubmission"];
  getMe: AppRouter["getMe"];
  apiSettings: ApiSettings;
  saveApiSettings: (apiSettings: ApiSettings) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const effectRan = useRef(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiUrl: "",
    apiToken: "",
  });

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const getApiSettings = async () => {
      const result = await browser.storage.local.get([
        STORAGE_API_URL_KEY,
        STORAGE_API_TOKEN_KEY,
      ]);
      console.log("## result from storage", result);
      // we update the settings
      const { apiUrl, apiToken } = result;
      setApiSettings({ apiUrl: apiUrl || "", apiToken: apiToken || "" });
    };
    getApiSettings();
  }, []);

  const saveApiSettings = async (apiSettings: ApiSettings) => {
    await browser.storage.local.set({
      apiUrl: apiSettings.apiUrl,
      apiToken: apiSettings.apiToken,
    });
    setApiSettings(apiSettings);
  };

  // Create tRPC client with current settings
  const getClient = () => {
    if (!apiSettings.apiUrl) {
      throw new Error("API URL not found");
    }
    return createApiClient(apiSettings.apiUrl, apiSettings.apiToken);
  };

  const submitContent: AppRouter["submitContent"] = async (
    input: Parameters<AppRouter["submitContent"]>[0]
  ) => {
    console.log("Submitting content to:", apiSettings.apiUrl);
    console.log("Submission body:", input);

    const client = getClient();
    return client.submitContent.mutate(input);
  };

  const approveSubmission: AppRouter["approveSubmission"] = async (
    input: Parameters<AppRouter["approveSubmission"]>[0]
  ) => {
    console.log("Approving submission to:", apiSettings.apiUrl);
    console.log("Submission body:", input);

    const client = getClient();
    return client.approveSubmission.mutate(input);
  };

  const cancelSubmission: AppRouter["cancelSubmission"] = async (
    input: Parameters<AppRouter["cancelSubmission"]>[0]
  ) => {
    console.log("Canceling submission to:", apiSettings.apiUrl);
    console.log("Submission body:", input);

    const client = getClient();
    return client.cancelSubmission.mutate(input);
  };

  const getMe: AppRouter["getMe"] = async () => {
    const client = getClient();
    return client.getMe.query();
  };

  const value = {
    submitContent,
    approveSubmission,
    cancelSubmission,
    getMe,
    apiSettings,
    saveApiSettings,
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
