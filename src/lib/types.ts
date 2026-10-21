export interface Item {
  id: number;
  name: string;
}

export type Kind = "project" | "task" | "response" | "flag";

export interface Response {
    id: number;
    responseLabel: string;
    responseText: string;
}