export interface ToolCall {
  name: string;
  input: Record<string, any>;
  result?: any;
  timestamp: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  sources?: string[];
  isStreaming?: boolean;
  timestamp: number;
}

export interface ResearchState {
  status:
    | "idle"
    | "thinking"
    | "searching"
    | "reading"
    | "writing"
    | "done"
    | "error";

  statusText: string;
  currentTool?: string;
}

export interface AgentEvent {
  type:
    | "thinking"
    | "tool_call"
    | "tool_result"
    | "answer_chunk"
    | "done"
    | "error";

  content?: string;
  name?: string;
  input?: any;
  result?: any;
  sources?: string[];
  message?: string;
}