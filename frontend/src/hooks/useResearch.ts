import { useCallback } from "react";
import { useConversationStore } from "../store/conversation";
import { streamQuery } from "../lib/api";
import type { Message } from "../types";

let messageIdCounter = 0;
const genId = () => `msg_${Date.now()}_${++messageIdCounter}`;

const TOOL_STATUS: Record<string, string> = {
  web_search: "Searching the web…",
  fetch_page: "Reading page…",
  extract_structured_data: "Extracting data…",
};

export function useResearch() {
  const {
    messages,
    addMessage,
    updateLastAssistantMessage,
    appendToLastAssistantContent,
    addToolCallToLast,
    addWorkflowStep,
    clearWorkflowSteps,
    setResearchState,
  } = useConversationStore();

  const submit = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      clearWorkflowSteps();

      // Add user message
      const userMsg: Message = {
        id: genId(),
        role: "user",
        content: query,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      // Add placeholder assistant message
      const assistantMsg: Message = {
        id: genId(),
        role: "assistant",
        content: "",
        toolCalls: [],
        isStreaming: true,
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);

      setResearchState({ status: "thinking", statusText: "Planning research…" });

      try {
        for await (const event of streamQuery(query, messages)) {
          switch (event.type) {
            case "thinking":

              if (event.content) {
                addWorkflowStep(event.content);
              }

              setResearchState({
                status: "thinking",
                statusText: event.content ?? "Thinking…",
              });

              break;

            case "tool_call":

              addWorkflowStep(
                TOOL_STATUS[event.name ?? ""] ?? "Using tool..."
              );

              setResearchState({
                status: "searching",
                statusText: TOOL_STATUS[event.name ?? ""] ?? "Working…",
                currentTool: event.name,
              });
              addToolCallToLast({
                name: event.name ?? "",
                input: event.input ?? {},
                timestamp: Date.now(),
              });
              break;

            case "tool_result":
              // Update the most recent tool call with its result
              // (we find by name since we just added it)
              setResearchState({
                status: "writing",
                statusText: "Synthesizing answer…",
              });
              break;

            case "answer_chunk":
              appendToLastAssistantContent(event.content ?? "");
              setResearchState({ status: "writing", statusText: "Writing answer…" });
              break;

            case "done":
              
              addWorkflowStep("Research completed");

              updateLastAssistantMessage({
                isStreaming: false,
                sources: event.sources ?? [],
              });
              setResearchState({ status: "done", statusText: "" });
              break;

            case "error":
              updateLastAssistantMessage({
                isStreaming: false,
                content: `⚠️ ${event.message ?? "An error occurred."}`,
              });
              setResearchState({ status: "error", statusText: event.message ?? "" });
              break;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        updateLastAssistantMessage({
          isStreaming: false,
          content: `⚠️ Connection error: ${msg}`,
        });
        setResearchState({ status: "error", statusText: msg });
      }
    },
    [
      messages,
      addMessage,
      updateLastAssistantMessage,
      appendToLastAssistantContent,
      addToolCallToLast,
      addWorkflowStep,
      clearWorkflowSteps,
      setResearchState,
    ]
  );

  return { submit };
}
