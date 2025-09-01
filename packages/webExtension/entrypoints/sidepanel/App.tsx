import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Wifi, WifiOff, Mic, Square, AlertCircle, CheckCircle } from 'lucide-react';
import type { 
  CheckConnectionRequest,
  ConnectBackendRequest,
  GetVideoInfoRequest,
  StartAudioCaptureRequest,
  StopAudioCaptureRequest,
  VideoDetectedMessage,
  ConnectionStatusMessage,
  AnalysisCompleteMessage,
  AnalysisErrorMessage,
  CheckConnectionResponse,
  ConnectBackendResponse,
  GetVideoInfoResponse,
  AudioCaptureResponse
} from '../../lib/types/messages.js';

declare const chrome: any;

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  failed: boolean;
}

interface VideoInfo {
  title: string;
  url: string;
  detected: boolean;
}

interface AnalysisResult {
  summary: string;
  duration: number;
  confidence: number;
}

function App() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    failed: false
  });
  
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({
    title: '',
    url: '',
    detected: false
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Check initial connection status
    checkConnectionStatus();
    
    // Check for current video
    checkCurrentVideo();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: VideoDetectedMessage | ConnectionStatusMessage | AnalysisCompleteMessage | AnalysisErrorMessage, _sender: any, _sendResponse: any) => {
      if (message.type === 'connection_status') {
        setConnectionStatus(message.status);
      } else if (message.type === 'video_detected') {
        setVideoInfo(message.video);
      } else if (message.type === 'analysis_complete') {
        setAnalysisResult(message.result);
        setIsCapturing(false);
        showNotification('success', 'Audio analysis completed!');
      } else if (message.type === 'analysis_error') {
        setIsCapturing(false);
        showNotification('error', 'Audio analysis failed');
      }
    });
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const message: CheckConnectionRequest = { type: 'check_connection' };
      const response = await chrome.runtime.sendMessage(message) as CheckConnectionResponse;
      if (response?.success) {
        setConnectionStatus({ connected: true, connecting: false, failed: false });
      }
    } catch (_error) {
      console.error('Failed to check connection:', _error);
    }
  };

  const checkCurrentVideo = async () => {
    try {
      const message: GetVideoInfoRequest = { type: 'get_video_info' };
      const response = await chrome.runtime.sendMessage(message) as GetVideoInfoResponse;
      if (response?.success && response.video) {
        setVideoInfo(response.video);
      }
    } catch (_error) {
      console.error('Failed to get video info:', _error);
    }
  };

  const handleConnect = async () => {
    setConnectionStatus({ connected: false, connecting: true, failed: false });
    
    try {
      const message: ConnectBackendRequest = { type: 'connect_backend' };
      const response = await chrome.runtime.sendMessage(message) as ConnectBackendResponse;
      if (response?.success) {
        setConnectionStatus({ connected: true, connecting: false, failed: false });
        showNotification('success', 'Connected to backend!');
      } else {
        setConnectionStatus({ connected: false, connecting: false, failed: true });
        showNotification('error', 'Failed to connect to backend');
      }
    } catch (_error) {
      setConnectionStatus({ connected: false, connecting: false, failed: true });
      showNotification('error', 'Connection error');
    }
  };

  const handleAudioCapture = async () => {
    if (isCapturing) {
      // Stop capture
      try {
        const message: StopAudioCaptureRequest = { type: 'stop_audio_capture' };
        await chrome.runtime.sendMessage(message) as AudioCaptureResponse;
        setIsCapturing(false);
        showNotification('success', 'Audio capture stopped');
      } catch (_error) {
        showNotification('error', 'Failed to stop capture');
      }
    } else {
      // Start capture
      try {
        const message: StartAudioCaptureRequest = { type: 'start_audio_capture' };
        const response = await chrome.runtime.sendMessage(message) as AudioCaptureResponse;
        if (response?.success) {
          setIsCapturing(true);
          showNotification('success', 'Audio capture started');
        } else {
          showNotification('error', 'Failed to start capture');
        }
      } catch (_error) {
        showNotification('error', 'Failed to start capture');
      }
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusIcon = () => {
    if (connectionStatus.connecting) return <Wifi className="w-4 h-4 animate-pulse" />;
    if (connectionStatus.connected) return <Wifi className="w-4 h-4 text-green-500" />;
    if (connectionStatus.failed) return <WifiOff className="w-4 h-4 text-red-500" />;
    return <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (connectionStatus.connecting) return 'Connecting...';
    if (connectionStatus.connected) return 'Connected';
    if (connectionStatus.failed) return 'Connection Failed';
    return 'Disconnected';
  };

  const getStatusBadgeVariant = () => {
    if (connectionStatus.connecting) return 'secondary';
    if (connectionStatus.connected) return 'default';
    if (connectionStatus.failed) return 'destructive';
    return 'outline';
  };

  return (
    <div className="h-full bg-background sidepanel">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 text-center">
        <h1 className="text-lg font-semibold mb-2">🎵 Audio Summary</h1>
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusBadgeVariant()} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)]">
        {/* Connection Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Backend Connection</CardTitle>
            <CardDescription>Connect to the audio processing backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleConnect}
              disabled={connectionStatus.connecting}
              className="w-full"
            >
              {connectionStatus.connecting ? 'Connecting...' : 'Connect to Backend'}
            </Button>
          </CardContent>
        </Card>

        {/* Audio Capture Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Audio Capture</CardTitle>
            <CardDescription>Capture audio from the current YouTube video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleAudioCapture}
              disabled={!connectionStatus.connected || !videoInfo.detected}
              variant={isCapturing ? "destructive" : "default"}
              className="w-full"
            >
              {isCapturing ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Capture
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Capture
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Video Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Video</CardTitle>
          </CardHeader>
          <CardContent>
            {videoInfo.detected ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {videoInfo.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {videoInfo.url}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No YouTube video detected</p>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results Card */}
        {analysisResult && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-foreground">{analysisResult.summary}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {analysisResult.duration}s</span>
                  <span>Confidence: {analysisResult.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-muted border-t border-border text-center">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-3 rounded-md text-white text-sm font-medium z-50 flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;
