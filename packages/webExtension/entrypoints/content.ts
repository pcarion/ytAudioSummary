// Content Script for YouTube Pages
import { defineContentScript } from 'wxt';

// import type { AudioStreamData } from '@yt-audio-summary/api-definition';

class YouTubeAudioHandler {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isStreaming = false;
  private currentVideoId: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.detectVideoPlayer();
    this.injectAudioControls();
    this.setupMessageListener();
  }

  private detectVideoPlayer() {
    const videoPlayer = document.querySelector('video');
    if (videoPlayer) {
      this.currentVideoId = this.getCurrentVideoId();
      console.log('YouTube video detected:', this.currentVideoId);
    }
  }

  private getCurrentVideoId(): string | null {
    const url = window.location.href;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }

  private injectAudioControls() {
    const controlsContainer = document.querySelector('.ytp-right-controls');
    if (controlsContainer && !document.getElementById('yt-audio-summary-btn')) {
      const button = document.createElement('button');
      button.id = 'yt-audio-summary-btn';
      button.innerHTML = '🎵 Audio Summary';
      button.className = 'ytp-button';
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 8px;
      `;
      
      button.addEventListener('click', () => {
        this.toggleAudioCapture();
      });
      
      controlsContainer.appendChild(button);
    }
  }

  private async toggleAudioCapture() {
    if (this.isStreaming) {
      await this.stopStream();
      this.updateButtonState(false);
    } else {
      await this.startStream();
      this.updateButtonState(true);
    }
  }

  private async startStream() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        if (this.isStreaming) {
          this.processAudioData(event);
        }
      };
      
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isStreaming = true;
      console.log('Audio stream started');
      
    } catch (error) {
      console.error('Failed to start audio stream:', error);
      throw error;
    }
  }

  private async stopStream() {
    this.isStreaming = false;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
    
    console.log('Audio stream stopped');
  }

  private processAudioData(event: AudioProcessingEvent) {
    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    
    // Convert to ArrayBuffer
    const audioChunk = new ArrayBuffer(inputData.length * 4);
    const view = new Float32Array(audioChunk);
    view.set(inputData);
    
    const audioData: any = {
      audioChunk,
      sampleRate: this.audioContext?.sampleRate ?? 44100,
      channels: 1,
      timestamp: Date.now(),
      videoId: this.currentVideoId || undefined
    };
    
    // Send to background script for processing
    chrome.runtime.sendMessage({
      action: 'processAudio',
      data: audioData
    }).catch(console.error);
  }

  private updateButtonState(isCapturing: boolean) {
    const button = document.getElementById('yt-audio-summary-btn');
    if (button) {
      button.innerHTML = isCapturing ? '⏹️ Stop Capture' : '🎵 Audio Summary';
      button.style.background = isCapturing ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    }
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === 'getVideoInfo') {
        sendResponse({
          videoId: this.currentVideoId,
          isStreaming: this.isStreaming
        });
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubeAudioHandler();
  });
} else {
  new YouTubeAudioHandler();
}

export default defineContentScript({
  matches: ['https://www.youtube.com/*']
});
