import { useState, useEffect } from "react";
import { ArrowLeft, Save, Settings, LogOut } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [formData, setFormData] = useState({
    apiUrl: "",
    accessToken: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // useEffect(() => {
  //   // Initialize form with current values
  //   setFormData({
  //     apiUrl: apiUrl || "",
  //     accessToken: accessToken || "",
  //   });
  // }, [apiUrl, accessToken]);

  const apiUrl = "";
  const accessToken = "";

  const handleInputChange = (
    field: "apiUrl" | "accessToken",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // await saveDebugSettings(formData);
      setSaveStatus("success");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current values
    setFormData({
      apiUrl: apiUrl || "",
      accessToken: accessToken || "",
    });
    setSaveStatus("idle");
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* API URL Field */}
          <div className="space-y-2">
            <label
              htmlFor="api-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              API URL
            </label>
            <input
              id="api-url"
              type="text"
              placeholder="https://api.example.com"
              value={formData.apiUrl}
              onChange={(e) => handleInputChange("apiUrl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Access Token Field */}
          <div className="space-y-2">
            <label
              htmlFor="access-token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Access Token
            </label>
            <input
              id="access-token"
              type="password"
              placeholder="Enter your access token"
              value={formData.accessToken}
              onChange={(e) => handleInputChange("accessToken", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Status Messages */}
          {saveStatus === "success" && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                Settings saved successfully!
              </p>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to save settings. Please try again.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
