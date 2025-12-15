export interface ImageData {
  base64: string;
  mimeType: string;
  url: string;
}

export interface EditHistoryItem {
  id: string;
  original: ImageData;
  edited: ImageData;
  prompt: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
