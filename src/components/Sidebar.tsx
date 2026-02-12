"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    HardDrive,
    Clock,
    Archive,
    Settings,
    LayoutGrid,
    FolderOpen,
    Pin,
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    MessageSquare,
    Crown,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProject, deleteProject } from "@/lib/actions/documents";
import type { Project } from "@/types/documents";
import { motion, AnimatePresence } from "framer-motion";

export type SidebarView =
    | "workspace"
    | "recent"
    | "starred"
    | "archived"
    | "settings"
    | { type: "project"; projectId: string; projectName: string };

interface SidebarProps {
    storageUsed: number;
    storageTotal: number;
    activeView: SidebarView;
    onNavigate: (view: SidebarView) => void;
    projects: Project[];
    docCounts: {
        total: number;
        recent: number;
        pinned: number;
        archived: number;
    };
    isCollapsed: boolean;
    onToggle: (collapsed: boolean) => void;
    isMobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({
    storageUsed,
    storageTotal,
    activeView,
    onNavigate,
    projects,
    docCounts = { total: 0, recent: 0, pinned: 0, archived: 0 },
    isCollapsed,
    onToggle,
    isMobile = false,
    isOpen = false,
    onClose,
}: SidebarProps) {
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [creatingProject, setCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);
    const pathname = usePathname();


    useEffect(() => {
        setLocalProjects(projects);
    }, [projects]);


    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const usagePercent = storageTotal > 0
        ? Math.min(Math.round((storageUsed / storageTotal) * 100), 100)
        : 0;


    const isViewActive = (view: string) => {
        if (typeof activeView === "string") return activeView === view;
        return false;
    };

    const isProjectActive = (projectId: string) => {
        if (typeof activeView === "object" && activeView.type === "project") {
            return activeView.projectId === projectId;
        }
        return false;
    };

    const handleCreateProject = async () => {
        const trimmed = newProjectName.trim();
        if (!trimmed) return;

        const result = await createProject(trimmed);
        if (result.success && result.project) {
            setLocalProjects((prev) => [result.project!, ...prev]);
            setNewProjectName("");
            setCreatingProject(false);
            onNavigate({
                type: "project",
                projectId: result.project.id,
                projectName: result.project.name,
            });
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        const result = await deleteProject(projectId);
        if (result.success) {
            setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
            if (isProjectActive(projectId)) {
                onNavigate("workspace");
            }
        }
    };

    return (
        <>
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isMobile ? 256 : (isCollapsed ? 80 : 256),
                    x: isMobile ? (isOpen ? 0 : -280) : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar/60 backdrop-blur-xl shadow-2xl flex flex-col",
                    isMobile ? "w-64" : ""
                )}
                suppressHydrationWarning
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border" suppressHydrationWarning>
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2 font-heading font-bold text-xl text-primary tracking-tight overflow-hidden whitespace-nowrap"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-inner shadow-primary/20">
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">DocuMind</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => onToggle(!isCollapsed)}
                        className={cn(
                            "rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground transition-all",
                            isCollapsed ? "mx-auto" : ""
                        )}
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 animate-in fade-in">
                            Main
                        </div>
                    )}
                    <NavItem
                        icon={LayoutGrid}
                        active={isViewActive("workspace")}
                        onClick={() => onNavigate("workspace")}
                        badge={docCounts.total}
                        collapsed={isCollapsed}
                        label="Workspace"
                    />

                    <NavLink
                        href="/dashboard/documents"
                        icon={FileText}
                        label="All Documents"
                        active={pathname === "/dashboard/documents"}
                        badge={docCounts.total}
                        collapsed={isCollapsed}
                    />

                    <NavLink
                        href="/dashboard/chat-history"
                        icon={MessageSquare}
                        label="Chat History"
                        active={pathname === "/dashboard/chat-history"}
                        collapsed={isCollapsed}
                    />

                    <div className="mt-6">
                        {!isCollapsed ? (
                            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground group">
                                <div
                                    className="flex flex-1 items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => setProjectsOpen(!projectsOpen)}
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    <span>Projects</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCreatingProject(true);
                                            setProjectsOpen(true);
                                        }}
                                        className="rounded p-1 hover:bg-primary/20 hover:text-primary transition-colors"
                                        title="New project"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                    <div
                                        className="cursor-pointer p-1 hover:bg-secondary/50 dark:hover:bg-white/5 rounded"
                                        onClick={() => setProjectsOpen(!projectsOpen)}
                                    >
                                        <motion.div
                                            animate={{ rotate: projectsOpen ? 90 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-px w-full bg-border my-4" />
                        )}

                        <AnimatePresence>
                            {projectsOpen && !isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 space-y-0.5 border-l border-border pl-3 overflow-hidden"
                                >
                                    {creatingProject && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-1 py-1 pr-2"
                                        >
                                            <input
                                                type="text"
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleCreateProject();
                                                    if (e.key === "Escape") {
                                                        setCreatingProject(false);
                                                        setNewProjectName("");
                                                    }
                                                }}
                                                placeholder="Name..."
                                                autoFocus
                                                className="w-full rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
                                            />
                                        </motion.div>
                                    )}

                                    {localProjects.length === 0 && !creatingProject && (
                                        <p className="px-3 py-2 text-[11px] text-muted-foreground/40 italic">
                                            No projects
                                        </p>
                                    )}

                                    {localProjects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() =>
                                                onNavigate({
                                                    type: "project",
                                                    projectId: project.id,
                                                    projectName: project.name,
                                                })
                                            }
                                            className={cn(
                                                "group/proj flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 relative",
                                                isProjectActive(project.id)
                                                    ? "text-primary bg-primary/5"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {isProjectActive(project.id) && (
                                                <motion.div
                                                    layoutId="activeProject"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r-full"
                                                />
                                            )}
                                            <span className="truncate">{project.name}</span>
                                            <div className="flex items-center gap-1">
                                                {(project.doc_count ?? 0) > 0 && (
                                                    <span className="text-[10px] text-muted-foreground/40">
                                                        {project.doc_count}
                                                    </span>
                                                )}
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => handleDeleteProject(e, project.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleDeleteProject(e as unknown as React.MouseEvent, project.id); }}
                                                    className="hidden rounded p-0.5 text-muted-foreground/40 hover:text-destructive group-hover/proj:block transition-colors cursor-pointer"
                                                    title="Delete project"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isCollapsed && (
                        <div className="mt-8 px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 animate-in fade-in">
                            Library
                        </div>
                    )}
                    {isCollapsed && <div className="h-px w-full bg-border my-4" />}

                    <NavItem
                        icon={Clock}
                        active={isViewActive("recent")}
                        onClick={() => onNavigate("recent")}
                        badge={docCounts.recent}
                        collapsed={isCollapsed}
                        label="Recent"
                    />
                    <NavItem
                        icon={Pin}
                        active={isViewActive("starred")}
                        onClick={() => onNavigate("starred")}
                        badge={docCounts.pinned}
                        collapsed={isCollapsed}
                        label="Pinned"
                    />
                    <NavItem
                        icon={Archive}
                        active={isViewActive("archived")}
                        onClick={() => onNavigate("archived")}
                        badge={docCounts.archived}
                        collapsed={isCollapsed}
                        label="Archived"
                    />

                    {!isCollapsed && (
                        <div className="mt-8 px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 animate-in fade-in">
                            System
                        </div>
                    )}
                    {isCollapsed && <div className="h-px w-full bg-border my-4" />}

                    <NavLink
                        href="/dashboard/plans"
                        icon={Crown}
                        label="Plans & Pricing"
                        active={pathname === "/dashboard/plans"}
                        collapsed={isCollapsed}
                    />

                    <NavItem
                        icon={Settings}
                        active={isViewActive("settings")}
                        onClick={() => onNavigate("settings")}
                        collapsed={isCollapsed}
                        label="Settings"
                    />
                </nav>

                {!isCollapsed ? (
                    <Link
                        href="/dashboard/plans"
                        className="mx-3 mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 border border-primary/20 px-3.5 py-3 transition-all hover:from-primary/15 hover:via-indigo-500/15 hover:to-primary/10 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 group"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-white shadow-sm">
                            <Zap className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground leading-none mb-0.5">Upgrade to Pro</p>
                            <p className="text-[10px] text-muted-foreground truncate">Unlimited docs & GPT-4o access</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </Link>
                ) : (
                    <Link
                        href="/dashboard/plans"
                        title="Upgrade to Pro"
                        className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20 transition-all hover:from-primary/25 hover:to-indigo-500/25 hover:ring-primary/40"
                    >
                        <Zap className="h-4 w-4" />
                    </Link>
                )}

                {/* Storage Section — visually rich */}
                <div className="p-4 border-t border-border" suppressHydrationWarning>
                    {!isCollapsed ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/30 dark:from-white/5 dark:to-white/[0.02] p-3.5 ring-1 ring-border/50 space-y-3"
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset",
                                        usagePercent >= 90
                                            ? "bg-red-500/15 text-red-400 ring-red-500/25"
                                            : usagePercent >= 70
                                                ? "bg-amber-500/15 text-amber-400 ring-amber-500/25"
                                                : "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
                                    )}>
                                        <HardDrive className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-foreground leading-none mb-0.5">Storage</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">{usagePercent}% used</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    usagePercent >= 90
                                        ? "bg-red-500/10 text-red-400"
                                        : usagePercent >= 70
                                            ? "bg-amber-500/10 text-amber-400"
                                            : "bg-emerald-500/10 text-emerald-400"
                                )}>
                                    {usagePercent < 70 ? "Healthy" : usagePercent < 90 ? "Warning" : "Full"}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 w-full rounded-full bg-secondary dark:bg-white/10 overflow-hidden">
                                <motion.div
                                    className={cn(
                                        "h-full rounded-full",
                                        usagePercent >= 90
                                            ? "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                            : usagePercent >= 70
                                                ? "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                                : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(usagePercent, 2)}%` }}
                                    transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                                />
                            </div>

                            {/* Size labels */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground font-mono">
                                    {formatBytes(storageUsed)}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 font-mono">
                                    {formatBytes(storageTotal)}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* Collapsed: circular progress ring */
                        <div className="flex flex-col items-center gap-1.5" title={`Storage: ${usagePercent}% used (${formatBytes(storageUsed)} / ${formatBytes(storageTotal)})`}>
                            <div className="relative h-10 w-10">
                                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        cx="18" cy="18" r="15" fill="none"
                                        className="stroke-secondary dark:stroke-white/10"
                                        strokeWidth="3"
                                    />
                                    <motion.circle
                                        cx="18" cy="18" r="15" fill="none"
                                        className={cn(
                                            usagePercent >= 90 ? "stroke-red-400" :
                                                usagePercent >= 70 ? "stroke-amber-400" :
                                                    "stroke-emerald-400"
                                        )}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 15}`}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - usagePercent / 100) }}
                                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                    {usagePercent}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
}

function NavItem({
    icon: Icon,
    label,
    active,
    onClick,
    badge,
    collapsed,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick?: () => void;
    badge?: number;
    collapsed?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={cn(
                "relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group overflow-hidden",
                active
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(124,58,237,0.1)]"
                    : "text-muted-foreground hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground",
                collapsed ? "justify-center px-2" : "justify-between"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/5 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}

            <div className={cn("flex items-center gap-3 relative z-10", collapsed && "gap-0")}>
                <Icon className={cn("h-4.5 w-4.5 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && (
                    <span className="font-medium tracking-tight">{label}</span>
                )}
            </div>

            {!collapsed && badge !== undefined && badge > 0 && (
                <span className={cn(
                    "relative z-10 text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center transition-all",
                    active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/60 dark:bg-white/10 text-muted-foreground group-hover:bg-secondary dark:group-hover:bg-white/20 group-hover:text-foreground"
                )}>
                    {badge}
                </span>
            )}

            {collapsed && badge !== undefined && badge > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
            )}
        </button>
    );
}

function NavLink({
    href,
    icon: Icon,
    label,
    active,
    badge,
    collapsed,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    badge?: number;
    collapsed?: boolean;
}) {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                "relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group overflow-hidden",
                active
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(124,58,237,0.1)]"
                    : "text-muted-foreground hover:bg-secondary/50 dark:hover:bg-white/5 hover:text-foreground",
                collapsed ? "justify-center px-2" : "justify-between"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeNavLink"
                    className="absolute inset-0 bg-primary/5 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}

            <div className={cn("flex items-center gap-3 relative z-10", collapsed && "gap-0")}>
                <Icon className={cn("h-4.5 w-4.5 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && (
                    <span className="font-medium tracking-tight">{label}</span>
                )}
            </div>

            {!collapsed && badge !== undefined && badge > 0 && (
                <span className={cn(
                    "relative z-10 text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center transition-all",
                    active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/60 dark:bg-white/10 text-muted-foreground group-hover:bg-secondary dark:group-hover:bg-white/20 group-hover:text-foreground"
                )}>
                    {badge}
                </span>
            )}

            {collapsed && badge !== undefined && badge > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
            )}
        </Link>
    );
}
