import { Globe, FileText, Cpu, PenLine, CheckCircle, AlertCircle } from "lucide-react";
import type { ResearchState } from "../types";
import { clsx } from "clsx";

const STATUS_CONFIG = {
  idle: { Icon: null, color: "text-ink-400", label: "" },
  thinking: { Icon: Cpu, color: "text-purple-500", label: "Planning" },
  searching: { Icon: Globe, color: "text-blue-500", label: "Searching" },
  reading: { Icon: FileText, color: "text-amber-500", label: "Reading" },
  writing: { Icon: PenLine, color: "text-emerald-500", label: "Writing" },
  done: { Icon: CheckCircle, color: "text-emerald-500", label: "Done" },
  error: { Icon: AlertCircle, color: "text-red-500", label: "Error" },
};

interface StatusBarProps {
  state: ResearchState;
}

export function StatusBar({ state }: StatusBarProps) {
  if (state.status === "idle") return null;

  const config = STATUS_CONFIG[state.status];
  const { Icon } = config;

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-ink-200 shadow-sm",
        "text-sm font-body w-fit animate-fade-in"
      )}
    >
      {Icon && (
        <Icon
          size={14}
          className={clsx(
            config.color,
            state.status !== "done" && state.status !== "error" && "animate-pulse"
          )}
        />
      )}
      <span className={clsx("font-medium", config.color)}>{config.label}</span>
      {state.statusText && (
        <span className="text-ink-500 text-xs">{state.statusText}</span>
      )}
    </div>
  );
}
