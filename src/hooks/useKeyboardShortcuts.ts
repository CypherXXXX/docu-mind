"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
    onSearch?: () => void;
    onEscape?: () => void;
}

export function useKeyboardShortcuts({ onSearch, onEscape }: ShortcutConfig) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                onSearch?.();
            }

            if (e.key === "Escape") {
                onEscape?.();
            }
        },
        [onSearch, onEscape]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}
