import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User } from "lucide-react";
import { clsx } from "clsx";
import { ToolCallPanel, SourcesList } from "./ToolCallPanel";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end animate-slide-up">
        <div className="max-w-xl bg-ink-900 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm">
          <p className="font-body text-base leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center shrink-0 mt-1">
          <User size={15} className="text-ink-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-slide-up">
      {/* Logo avatar */}
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="font-display font-bold text-white text-sm">E</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Tool calls panel */}
        {(message.toolCalls?.length ?? 0) > 0 && (
          <ToolCallPanel toolCalls={message.toolCalls!} />
        )}

        {/* Answer */}
        <div
          className={clsx(
            "prose-explicate",
            message.isStreaming && !message.content && "shimmer h-20 rounded-xl"
          )}
        >
          {message.content ? (
            <div className={clsx(message.isStreaming && "streaming-cursor")}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : message.isStreaming ? null : (
            <p className="text-ink-400 italic text-sm">No response</p>
          )}
        </div>

        {/* Sources */}
        {!message.isStreaming && message.sources && message.sources.length > 0 && (
          <SourcesList sources={message.sources} />
        )}
      </div>
    </div>
  );
}
