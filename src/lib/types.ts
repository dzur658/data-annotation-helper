export interface Item {
  id: number;
  name: string;
}

export type Kind = "project" | "task" | "response" | "flag";

export type ResponseLabel = "A" | "B";

export interface Response {
    id: number;
    responseLabel: ResponseLabel;
    responseText: string;
}

export interface NewResponse {
    responseLabel: ResponseLabel;
    responseText: string;
}

export interface ResponsePair {
  a: Response | null;
  b: Response | null;
}

export interface NewResponsePair {
    taskId: number;
    responseA: NewResponse;
    responseB: NewResponse;
}

export interface Flag {
  id: number;
  responseId: number;
  sentenceText: string;
  flagType: string;
  flagResolution: string;
  reasoningNote: string;
}