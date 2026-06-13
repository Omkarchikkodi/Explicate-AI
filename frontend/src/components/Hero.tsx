import { Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "What are the latest breakthroughs in AI research this week?",
  "Compare the top 5 open-source LLMs available today",
  "Explain how Retrieval-Augmented Generation works",
  "What is the current price and market cap of Bitcoin?",
  "Best practices for building production FastAPI apps",
  "What happened at the latest Apple event?",
];

interface HeroProps {
  onQuerySelect: (q: string) => void;
}

export function Hero({ onQuerySelect }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Wordmark */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="font-display font-bold text-white text-3xl">E</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-3">
          Explicate AI
        </h1>
        <p className="font-body text-ink-500 text-lg max-w-md mx-auto leading-relaxed">
          Your autonomous web research agent. Ask anything — it searches, reads, and synthesizes in real time.
        </p>
      </div>

      {/* Example queries */}
      <div className="w-full max-w-2xl mt-4">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Sparkles size={14} className="text-accent" />
          <p className="text-xs font-body font-medium text-ink-400 uppercase tracking-wider">
            Try asking
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => onQuerySelect(q)}
              className="text-left px-4 py-3 rounded-xl border border-ink-200 bg-white hover:border-accent/40 hover:bg-accent/5 transition-all duration-150 group"
            >
              <p className="text-sm font-body text-ink-700 group-hover:text-ink-900 leading-snug">
                {q}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
