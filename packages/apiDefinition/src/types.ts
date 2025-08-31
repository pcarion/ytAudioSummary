// Shared API Types

export interface AudioStreamData {
  audioChunk: ArrayBuffer;
  sampleRate: number;
  channels: number;
  timestamp: number;
  videoId?: string;
}

export interface AudioAnalysisResult {
  id: string;
  videoId: string;
  summary: string;
  transcript: string;
  duration: number;
  processedAt: Date;
  confidence: number;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  error?: string;
  connectionId?: string;
  lastActivity: Date;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
