import React, { useState, useEffect } from "react";
import { ApiProvider, useApi } from "../../lib/ApiContext";
import { Home } from "./home";
import { FeedPage } from "./feed";
import { SettingsPage } from "./settings";

type Page = "home" | "feed" | "settings";

function AppContent() {
	const [currentPage, setCurrentPage] = useState<Page>("home");
	const { isApiConfigured } = useApi();

	// Check if API settings are configured and redirect to settings if not
	useEffect(() => {
		if (!isApiConfigured && currentPage !== "settings") {
			setCurrentPage("settings");
		}
	}, [isApiConfigured, currentPage]);

	return (
		<>
			{currentPage === "home" && (
				<Home
					onNavigateToFeed={() => setCurrentPage("feed")}
					onNavigateToSettings={() => setCurrentPage("settings")}
				/>
			)}
			{currentPage === "feed" && (
				<FeedPage onBack={() => setCurrentPage("home")} />
			)}
			{currentPage === "settings" && (
				<SettingsPage onBack={() => setCurrentPage("home")} />
			)}
		</>
	);
}

function App() {
	return (
		<ApiProvider>
			<AppContent />
		</ApiProvider>
	);
}

export default App;
