import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { MessageBubble } from "./components/MessageBubble";
import { StatusBar } from "./components/StatusBar";
import { Hero } from "./components/Hero";
import WorkflowPanel from "./components/WorkflowPanel";
import ResearchStats from "./components/ResearchStats";
import { useConversationStore } from "./store/conversation";
import { useResearch } from "./hooks/useResearch";

export default function App() {
  const {
    messages,
    workflowSteps,
    researchState,
    clearConversation,
  } = useConversationStore();
  const { submit } = useResearch();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom as new content streams in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">E</span>
            </div>
            <span className="font-display font-semibold text-ink-900 text-lg">
              Explicate
            </span>
            <span className="text-xs font-body font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              AI
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              ● Agentic Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasMessages && (
              <button
                onClick={clearConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-body text-ink-500 hover:text-ink-800 rounded-lg hover:bg-ink-100 transition-all"
              >
                <Trash2 size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {!hasMessages ? (
          <Hero onQuerySelect={submit} />
        ) : (
          <div className="space-y-8 pb-32">

            <WorkflowPanel steps={workflowSteps} />

            <ResearchStats steps={workflowSteps.length} />

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-ink-100">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
          {hasMessages && <StatusBar state={researchState} />}
          <SearchBar
            onSubmit={submit}
            researchState={researchState}
            isLarge={!hasMessages}
          />
          <p className="text-center text-xs text-ink-400 font-body">
            Explicate AI may make mistakes. Verify important information independently.
          </p>
        </div>
      </div>
    </div>
  );
}
