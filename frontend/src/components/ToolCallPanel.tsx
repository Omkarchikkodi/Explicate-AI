import { useState } from "react";
import { Globe, FileText, Table, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { ToolCall } from "../types";
import { clsx } from "clsx";

const TOOL_ICONS: Record<string, typeof Globe> = {
  web_search: Globe,
  fetch_page: FileText,
  extract_structured_data: Table,
};

const TOOL_LABELS: Record<string, string> = {
  web_search: "Web Search",
  fetch_page: "Read Page",
  extract_structured_data: "Extract Data",
};

interface ToolCallPanelProps {
  toolCalls: ToolCall[];
}

export function ToolCallPanel({ toolCalls }: ToolCallPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (toolCalls.length === 0) return null;

  return (
    <div className="mb-5 space-y-2">
      <p className="text-xs font-body font-medium text-ink-400 uppercase tracking-wider mb-3">
        Research Steps
      </p>
      {toolCalls.map((tc, i) => {
        const Icon = TOOL_ICONS[tc.name] ?? Globe;
        const label = TOOL_LABELS[tc.name] ?? tc.name;
        const isExpanded = expanded === i;

        return (
          <div
            key={i}
            className="border border-ink-200 rounded-xl overflow-hidden bg-white"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-ink-700">{label}</span>
                <span className="ml-2 text-xs text-ink-400 font-mono truncate">
                  {tc.input.query as string || tc.input.url as string || ""}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp size={14} className="text-ink-400 shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-ink-400 shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-ink-100 animate-fade-in">
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-ink-400 mb-1">Input</p>
                    <pre className="text-xs font-mono bg-ink-50 text-ink-700 rounded-lg p-3 overflow-x-auto">
                      {JSON.stringify(tc.input, null, 2)}
                    </pre>
                  </div>
                  {tc.result && (
                    <div>
                      <p className="text-xs font-medium text-ink-400 mb-1">Result</p>
                      <pre className="text-xs font-mono bg-ink-950 text-ink-200 rounded-lg p-3 overflow-x-auto max-h-48">
                        {JSON.stringify(tc.result, null, 2).slice(0, 2000)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SourcesListProps {
  sources: string[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-ink-200">
      <p className="text-xs font-body font-medium text-ink-400 uppercase tracking-wider mb-3">
        Sources
      </p>
      <div className="space-y-1">
        {sources.map((url, i) => {
          let hostname = url;
          try {
            hostname = new URL(url).hostname.replace("www.", "");
          } catch {}
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex items-center gap-2 text-sm text-ink-600 hover:text-accent",
                "transition-colors group"
              )}
            >
              <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-500 flex items-center justify-center text-xs shrink-0">
                {i + 1}
              </span>
              <span className="font-mono text-xs truncate">{hostname}</span>
              <ExternalLink
                size={11}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
