// @ts-nocheck - tRPC client types are complex but work correctly at runtime
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import { createApiClient, type ApiClient } from "../trpc/client";
import type { AppRouter } from "@yt-audio-summary/cf-backend/src/router";

// Export tRPC types for easier usage
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Use the proper tRPC input/output types
export type SubmitContentInput = RouterInputs["submitContent"];
export type SubmitContentOutput = RouterOutputs["submitContent"];
export type ApproveSubmissionInput = RouterInputs["approveSubmission"];
export type ApproveSubmissionOutput = RouterOutputs["approveSubmission"];
export type CancelSubmissionInput = RouterInputs["cancelSubmission"];
export type CancelSubmissionOutput = RouterOutputs["cancelSubmission"];
export type GetMeOutput = RouterOutputs["getMe"];

// keys to store the auth settings in the browser storage
const STORAGE_API_TOKEN_KEY = "apiToken";
const STORAGE_API_URL_KEY = "apiUrl";

interface ApiSettings {
	apiUrl: string;
	apiToken: string;
}

interface ApiContextType {
	submitContent: (input: SubmitContentInput) => Promise<SubmitContentOutput>;
	approveSubmission: (
		input: ApproveSubmissionInput
	) => Promise<ApproveSubmissionOutput>;
	cancelSubmission: (
		input: CancelSubmissionInput
	) => Promise<CancelSubmissionOutput>;
	getMe: () => Promise<GetMeOutput>;
	apiSettings: ApiSettings;
	saveApiSettings: (apiSettings: ApiSettings) => Promise<void>;
	isApiConfigured: boolean;
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

	const submitContent = async (
		input: SubmitContentInput
	): Promise<SubmitContentOutput> => {
		console.log("Submitting content to:", apiSettings.apiUrl);
		console.log("Submission body:", input);

		const client = getClient();
		return client.submitContent.mutate(input);
	};

	const approveSubmission = async (
		input: ApproveSubmissionInput
	): Promise<ApproveSubmissionOutput> => {
		console.log("Approving submission to:", apiSettings.apiUrl);
		console.log("Submission body:", input);

		const client = getClient();
		return client.approveSubmission.mutate(input);
	};

	const cancelSubmission = async (
		input: CancelSubmissionInput
	): Promise<CancelSubmissionOutput> => {
		console.log("Canceling submission to:", apiSettings.apiUrl);
		console.log("Submission body:", input);

		const client = getClient();
		return client.cancelSubmission.mutate(input);
	};

	const getMe = async (): Promise<GetMeOutput> => {
		const client = getClient();
		return client.getMe.query();
	};

	const isApiConfigured =
		apiSettings.apiUrl.trim() !== "" && apiSettings.apiToken.trim() !== "";

	const value = {
		submitContent,
		approveSubmission,
		cancelSubmission,
		getMe,
		apiSettings,
		saveApiSettings,
		isApiConfigured,
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
