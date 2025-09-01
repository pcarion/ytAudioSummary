import React, { useState } from "react";
import { ApiProvider } from "../../lib/ApiContext";
import { Home } from "./home";
import { FeedPage } from "./feed";
import { SettingsPage } from "./settings";

type Page = "home" | "feed" | "settings";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

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
