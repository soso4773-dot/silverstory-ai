export interface Concept {
  id: number;
  title: string;
  logline: string;
  synopsis: string;
  characters: string[];
  tone: string;
}

export interface GeneratedScript {
  conceptId: number;
  content: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}