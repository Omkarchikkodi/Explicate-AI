import type { AgentEvent, Message } from "../types";

const API_BASE = "https://explicate-ai-backend.onrender.com/api";

export async function* streamQuery(
  query: string,
  conversationHistory: Message[]
): AsyncGenerator<AgentEvent> {
  // Build history in the format the backend expects
  const history = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch(`${API_BASE}/query/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversation_history: history }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") return;
      try {
        const event: AgentEvent = JSON.parse(raw);
        yield event;
      } catch {
        // Ignore malformed events
      }
    }
  }
}

export async function fetchSuggestions(partial: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${API_BASE}/suggest?q=${encodeURIComponent(partial)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions ?? [];
  } catch {
    return [];
  }
}
