// Popup Controller
// import type { AudioAnalysisResult } from '@yt-audio-summary/api-definition';

class PopupController {
  private connectionStatus: HTMLElement | null = null;
  private connectButton: HTMLButtonElement | null = null;
  private audioCaptureButton: HTMLButtonElement | null = null;
  private statusIndicator: HTMLElement | null = null;
  private videoInfo: HTMLElement | null = null;
  private resultsSection: HTMLElement | null = null;
  private resultsContent: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.fetchConnectionStatus();
    this.checkCurrentVideo();
  }

  private initializeElements(): void {
    this.connectionStatus = document.getElementById('connection-status');
    this.connectButton = document.getElementById('connect-btn') as HTMLButtonElement;
    this.audioCaptureButton = document.getElementById('audio-capture-btn') as HTMLButtonElement;
    this.statusIndicator = document.getElementById('status-indicator');
    this.videoInfo = document.getElementById('video-info');
    this.resultsSection = document.getElementById('results-section');
    this.resultsContent = document.getElementById('results-content');
  }

  private setupEventListeners(): void {
    if (this.connectButton) {
      this.connectButton.addEventListener('click', () => this.toggleConnection());
    }

    if (this.audioCaptureButton) {
      this.audioCaptureButton.addEventListener('click', () => this.toggleAudioCapture());
    }

    // Listen for connection state changes
    chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
      if (request.action === 'connectionStateChanged') {
        this.updateConnectionStatus(request.state);
      }
    });
  }

  private async toggleConnection(): Promise<void> {
    if (!this.connectButton) return;

    const isConnected = this.connectButton.textContent === 'Disconnect';
    
    try {
      if (isConnected) {
        await this.disconnect();
      } else {
        await this.connect();
      }
    } catch (error) {
      console.error('Connection toggle failed:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async connect(): Promise<void> {
    if (!this.connectButton) return;

    this.connectButton.disabled = true;
    this.connectButton.textContent = 'Connecting...';

    try {
      // Test connection by calling health endpoint
      const response = await fetch('https://your-backend-url.com/api/health');
      
      if (response.ok) {
        this.connectButton.textContent = 'Disconnect';
        this.updateStatusIndicator('connected');
        this.showSuccess('Connected to backend API');
        
        // Enable audio capture button
        if (this.audioCaptureButton) {
          this.audioCaptureButton.disabled = false;
        }
      } else {
        throw new Error('Backend connection failed');
      }
    } catch (error) {
      this.connectButton.textContent = 'Connect';
      throw error;
    } finally {
      this.connectButton.disabled = false;
    }
  }

  private async disconnect(): Promise<void> {
    if (!this.connectButton) return;

    this.connectButton.disabled = true;
    this.connectButton.textContent = 'Disconnecting...';

    try {
      this.connectButton.textContent = 'Connect';
      this.updateStatusIndicator('disconnected');
      this.showSuccess('Disconnected from backend API');
      
      // Disable audio capture button
      if (this.audioCaptureButton) {
        this.audioCaptureButton.disabled = true;
      }
    } catch (error) {
      this.connectButton.textContent = 'Disconnect';
      throw error;
    } finally {
      this.connectButton.disabled = false;
    }
  }

  private async toggleAudioCapture(): Promise<void> {
    if (!this.audioCaptureButton) return;

    const isCapturing = this.audioCaptureButton.textContent === 'Stop Capture';
    
    try {
      if (isCapturing) {
        await this.stopAudioCapture();
      } else {
        await this.startAudioCapture();
      }
    } catch (error) {
      console.error('Audio capture toggle failed:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async startAudioCapture(): Promise<void> {
    if (!this.audioCaptureButton) return;

    this.audioCaptureButton.disabled = true;
    this.audioCaptureButton.textContent = 'Starting...';

    try {
      // Send message to content script to start capture
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'startCapture' });
        
        if (response?.success) {
          this.audioCaptureButton.textContent = 'Stop Capture';
          this.audioCaptureButton.style.background = '#ff4444';
          this.showSuccess('Audio capture started');
        } else {
          throw new Error('Failed to start audio capture');
        }
      } else {
        throw new Error('No active tab found');
      }
    } catch (error) {
      this.audioCaptureButton.textContent = 'Start Capture';
      throw error;
    } finally {
      this.audioCaptureButton.disabled = false;
    }
  }

  private async stopAudioCapture(): Promise<void> {
    if (!this.audioCaptureButton) return;

    this.audioCaptureButton.disabled = true;
    this.audioCaptureButton.textContent = 'Stopping...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'stopCapture' });
        
        if (response?.success) {
          this.audioCaptureButton.textContent = 'Start Capture';
          this.audioCaptureButton.style.background = '#4CAF50';
          this.showSuccess('Audio capture stopped');
        } else {
          throw new Error('Failed to stop audio capture');
        }
      } else {
        throw new Error('No active tab found');
      }
    } catch (error) {
      this.audioCaptureButton.textContent = 'Stop Capture';
      throw error;
    } finally {
      this.audioCaptureButton.disabled = false;
    }
  }

  private async checkCurrentVideo(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id && tab.url?.includes('youtube.com/watch')) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' });
        
        if (response?.videoId) {
          this.updateVideoInfo(response.videoId);
        }
      }
    } catch (error) {
      console.error('Failed to check current video:', error);
    }
  }

  private updateVideoInfo(videoId: string): void {
    if (this.videoInfo) {
      this.videoInfo.textContent = `Video ID: ${videoId}`;
    }
  }

  private async fetchConnectionStatus(): Promise<void> {
    try {
      const response = await fetch('https://your-backend-url.com/api/health');
      const isConnected = response.ok;
      
      this.updateConnectionStatus({
        status: isConnected ? 'connected' : 'disconnected'
      });
    } catch (error) {
      console.error('Failed to get connection status:', error);
    }
  }

  private updateConnectionStatus(state: { status: string }): void {
    if (this.connectionStatus) {
      this.connectionStatus.textContent = `Status: ${state.status}`;
    }

    if (this.statusIndicator) {
      this.updateStatusIndicator(state.status);
    }
  }

  private updateStatusIndicator(status: string): void {
    if (!this.statusIndicator) return;

    this.statusIndicator.className = `status-indicator ${status}`;
    this.statusIndicator.title = `Status: ${status}`;
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
