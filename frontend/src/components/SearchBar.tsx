import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { fetchSuggestions } from "../lib/api";
import type { ResearchState } from "../types";
import { clsx } from "clsx";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  researchState: ResearchState;
  isLarge?: boolean;
}

export function SearchBar({ onSubmit, researchState, isLarge = false }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = researchState.status !== "idle" && researchState.status !== "done" && researchState.status !== "error";

  const handleSubmit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q || isLoading) return;
      setValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      onSubmit(q);
    },
    [onSubmit, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex]);
      } else {
        handleSubmit(value);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length > 1) {
      debounceRef.current = setTimeout(async () => {
        const s = await fetchSuggestions(value);
        setSuggestions(s);
        setShowSuggestions(s.length > 0);
        setSelectedIndex(-1);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  return (
    <div className={clsx("relative w-full", isLarge ? "max-w-2xl" : "max-w-full")}>
      <div
        className={clsx(
          "flex items-center gap-3 bg-white border rounded-2xl shadow-sm transition-all duration-200",
          "focus-within:shadow-md focus-within:border-accent/40",
          isLarge ? "px-5 py-4 border-ink-200" : "px-4 py-3 border-ink-200"
        )}
      >
        {isLoading ? (
          <Loader2
            size={isLarge ? 22 : 18}
            className="text-accent shrink-0 animate-spin"
          />
        ) : (
          <Search
            size={isLarge ? 22 : 18}
            className="text-ink-400 shrink-0"
          />
        )}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={isLoading ? researchState.statusText : "Ask anything…"}
          disabled={isLoading}
          className={clsx(
            "flex-1 bg-transparent outline-none font-body text-ink-900 placeholder-ink-400",
            isLarge ? "text-lg" : "text-base",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        />

        <button
          onClick={() => handleSubmit(value)}
          disabled={!value.trim() || isLoading}
          className={clsx(
            "shrink-0 p-2 rounded-xl transition-all duration-150",
            value.trim() && !isLoading
              ? "bg-accent text-white hover:bg-accent-dark shadow-sm"
              : "bg-ink-100 text-ink-400 cursor-not-allowed"
          )}
        >
          <ArrowRight size={isLarge ? 20 : 16} />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          {suggestions.map((s, i) => (
            <button
              key={s}
              onMouseDown={() => handleSubmit(s)}
              className={clsx(
                "w-full text-left px-4 py-3 text-sm font-body transition-colors flex items-center gap-3",
                i === selectedIndex
                  ? "bg-ink-50 text-ink-900"
                  : "text-ink-700 hover:bg-ink-50"
              )}
            >
              <Search size={14} className="text-ink-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
