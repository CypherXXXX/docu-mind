"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
    Search,
    ChevronRight,
    LogOut,
    User,
    LayoutGrid,
    List,
    Upload,
    ArrowLeft,
    Sun,
    Moon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import type { SidebarView } from "@/components/Sidebar";

type ViewMode = "grid" | "list";

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchInputRef?: React.RefObject<HTMLInputElement | null>;
    activeView: SidebarView;
    docCount: number;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onQuickUpload?: () => void;
    onBack?: () => void;
    onMenuClick?: () => void;
}

function getViewLabel(view: SidebarView): { parent: string; current: string } {
    if (typeof view === "object" && view.type === "project") {
        return { parent: "Projects", current: view.projectName };
    }
    switch (view) {
        case "workspace":
            return { parent: "Workspace", current: "All Documents" };
        case "recent":
            return { parent: "Library", current: "Recent" };
        case "starred":
            return { parent: "Library", current: "Starred" };
        case "archived":
            return { parent: "Library", current: "Archived" };
        case "settings":
            return { parent: "System", current: "Settings" };
        default:
            return { parent: "Workspace", current: "All Documents" };
    }
}

export function Header({
    searchQuery,
    setSearchQuery,
    searchInputRef,
    activeView,
    docCount,
    viewMode,
    onViewModeChange,
    onQuickUpload,
    onBack,
    onMenuClick,
}: HeaderProps) {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const { theme, setTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const profileImage = user?.imageUrl;
    const userEmail =
        user?.primaryEmailAddress?.emailAddress || user?.username || "User";
    const userName = user?.fullName || user?.firstName || "User";

    const { parent, current } = getViewLabel(activeView);
    const showViewToggle = activeView !== "settings";
    const showBackButton = activeView !== "workspace";
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/60 px-4 md:px-6 backdrop-blur-xl transition-all shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden rounded-lg p-2 -ml-2 text-muted-foreground hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground transition-colors"
                    >
                        <List className="h-5 w-5" />
                    </button>
                )}
                {showBackButton && onBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="group gap-2 pl-2 pr-3 text-muted-foreground hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                )}
                {showBackButton && onBack && (
                    <div className="h-4 w-px bg-border" />
                )}

                <div className={cn("flex items-center gap-2 text-sm", isSearchOpen && "hidden sm:flex")}>
                    <span className="font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default">{parent}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    <span className="font-medium text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md truncate max-w-[120px] sm:max-w-none">{current}</span>
                </div>

                {showViewToggle && docCount > 0 && (
                    <span className={cn("hidden sm:inline-flex ml-2 rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground", isSearchOpen && "hidden")}>
                        {docCount}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                {!isSearchOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(true)}
                        className="sm:hidden text-muted-foreground hover:text-foreground"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                )}

                <div className={cn(
                    "relative group transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isSearchOpen
                        ? "fixed inset-x-4 top-3 z-30 w-auto sm:static sm:w-64 sm:block"
                        : "w-64 hidden sm:block",
                    "focus-within:w-72"
                )}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                            if (!searchQuery) setIsSearchOpen(false);
                        }}
                        className="h-9 w-full bg-secondary/30 pl-9 pr-12 border-border hover:bg-secondary/50 focus-visible:bg-background focus-visible:border-primary/30 shadow-lg sm:shadow-none"
                        autoFocus={isSearchOpen}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-secondary/50 dark:bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-60">
                            Ctrl+K
                        </kbd>
                        {isSearchOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mt-0.5 sm:hidden"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                }}
                            >
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>
                        )}
                    </div>
                </div>

                {(!isSearchOpen) && (
                    <>
                        {showViewToggle && (
                            <div className="flex items-center rounded-xl border border-border bg-secondary/30 p-1">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => onViewModeChange("grid")}
                                    className={cn(
                                        "h-7 w-7 rounded-lg",
                                        viewMode === "grid"
                                            ? "bg-background text-primary shadow-sm ring-1 ring-border hover:bg-background"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5"
                                    )}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => onViewModeChange("list")}
                                    className={cn(
                                        "h-7 w-7 rounded-lg",
                                        viewMode === "list"
                                            ? "bg-background text-primary shadow-sm ring-1 ring-border hover:bg-background"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5"
                                    )}
                                    title="List view"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {showViewToggle && onQuickUpload && (
                            <Button
                                onClick={onQuickUpload}
                                className="hidden md:flex gap-2 shadow-lg shadow-primary/20"
                            >
                                <Upload className="h-4 w-4" />
                                <span>Upload</span>
                            </Button>
                        )}

                        {mounted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        )}

                        <div className="h-6 w-px bg-border mx-1" />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="group relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-border hover:ring-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                {profileImage ? (
                                    <Image
                                        src={profileImage}
                                        alt={userName}
                                        width={36}
                                        height={36}
                                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </button>

                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 6 }}
                                        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-background/95 p-1 shadow-2xl backdrop-blur-2xl"
                                    >
                                        <div className="p-4 border-b border-border mb-1">
                                            <p className="font-semibold text-foreground">{userName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                        </div>

                                        <div className="space-y-0.5 px-2">
                                            <button
                                                onClick={() => { openUserProfile(); setShowDropdown(false); }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile Settings
                                            </button>
                                        </div>

                                        <div className="mt-2 border-t border-border p-2">
                                            <button
                                                onClick={() => signOut({ redirectUrl: "/" })}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
