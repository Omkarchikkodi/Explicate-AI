import { create } from "zustand";
import type { Message, ResearchState, ToolCall } from "../types";

interface ConversationStore {
  messages: Message[];
  researchState: ResearchState;

  workflowSteps: string[];

  addMessage: (msg: Message) => void;
  updateLastAssistantMessage: (patch: Partial<Message>) => void;
  appendToLastAssistantContent: (chunk: string) => void;
  addToolCallToLast: (tc: ToolCall) => void;

  addWorkflowStep: (step: string) => void;
  clearWorkflowSteps: () => void;

  setResearchState: (state: Partial<ResearchState>) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  messages: [],
  workflowSteps: [],
  researchState: { status: "idle", statusText: "" },

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistantMessage: (patch) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = { ...msgs[i], ...patch };
          break;
        }
      }
      return { messages: msgs };
    }),

  appendToLastAssistantContent: (chunk) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = { ...msgs[i], content: msgs[i].content + chunk };
          break;
        }
      }
      return { messages: msgs };
    }),

  addToolCallToLast: (tc) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = {
            ...msgs[i],
            toolCalls: [...(msgs[i].toolCalls || []), tc],
          };
          break;
        }
      }
      return { messages: msgs };
    }),

  addWorkflowStep: (step) =>
    set((s) => {

      const last =
        s.workflowSteps[s.workflowSteps.length - 1];

      if (last === step) {
        return s;
      }

      return {
        workflowSteps: [...s.workflowSteps, step],
      };
    }),

  clearWorkflowSteps: () =>
    set({
      workflowSteps: [],
    }),

  setResearchState: (state) =>
    set((s) => ({
      researchState: { ...s.researchState, ...state },
    })),

  clearConversation: () =>
    set({
      messages: [],
      workflowSteps: [],
      researchState: {
        status: "idle",
        statusText: "",
      },
    }),
}));
