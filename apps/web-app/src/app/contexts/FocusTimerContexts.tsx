import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import {
    createTimerSession,
    getActiveTimerSession,
    updateTimerSession,
    completeTimerSession,
    deleteTimerSession,
    getTimerSessions,
} from "@/api/individual/individual";
import { toast } from "react-hot-toast";
import type { FocusSession } from "@/api/individual/types";
import type { FocusTimerStatus } from "@/api/shared/types";
interface FocusTimerContextType {
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    totalDuration: number;
    setTotalDuration: React.Dispatch<React.SetStateAction<number>>;
    isRunning: boolean;
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
    isCompleted: boolean;
    setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
    sessionId: string | null;
    setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
    customMinutes: string;
    setCustomMinutes: React.Dispatch<React.SetStateAction<string>>;
    isInitializing: boolean;
    history: FocusSession[];
    isLoadingHistory: boolean;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    handleStartPause: () => Promise<void>;
    handleReset: () => Promise<void>;
    handleDeleteHistory: (id: string) => Promise<void>;
    fetchHistory: (userId: string, currentPage?: number) => Promise<void>;
    formatTime: (seconds: number) => string;
}
const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);
export function FocusTimerProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
    const [totalDuration, setTotalDuration] = useState<number>(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [history, setHistory] = useState<FocusSession[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [customMinutes, setCustomMinutes] = useState("25");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;
    const sessionIdRef = useRef<string | null>(null);
    const timeLeftRef = useRef(timeLeft);
    const totalDurationRef = useRef(totalDuration);
    const isRunningRef = useRef(isRunning);
    // Keep refs synchronized to prevent stale closure issues in intervals
    useEffect(() => {
        timeLeftRef.current = timeLeft;
        totalDurationRef.current = totalDuration;
        isRunningRef.current = isRunning;
        sessionIdRef.current = sessionId;
    }, [timeLeft, totalDuration, isRunning, sessionId]);
    // Load active session from database on startup
    useEffect(() => {
        const init = async () => {
            const userId = user?.id;
            if (!userId) {
                setIsInitializing(false);
                return;
            }
            try {
                const res = await getActiveTimerSession(userId);
                if (res.success && res.data) {
                    const session = res.data;
                    if (session.status !== "COMPLETED") {
                        const durationSecs = (session.duration || 25) * 60;
                        const progress = session.currentProgress || 0;
                        const remaining = Math.max(
                            0,
                            durationSecs - (durationSecs * progress) / 100,
                        );
                        setSessionId(session.id);
                        sessionIdRef.current = session.id;
                        setTotalDuration(durationSecs);
                        setTimeLeft(Math.floor(remaining));
                        if (session.status === "IN_PROGRESS") {
                            setIsRunning(true);
                        }
                    }
                }
                fetchHistory(userId);
            } catch (err) {
                console.error("Failed to restore session", err);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [user?.id]);
    useEffect(() => {
        const userId = user?.id;
        if (userId) {
            fetchHistory(userId, page);
        }
    }, [page, user?.id]);
    const fetchHistory = async (userId: string, currentPage = page) => {
        setIsLoadingHistory(true);
        try {
            const res = await getTimerSessions(userId, { page: String(currentPage), limit: String(limit) });
            if (res.success) {
                const entries = Array.isArray(res.data) ? res.data : res.data || [];
                setHistory(
                    entries.sort(
                        (a: FocusSession, b: FocusSession) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                );
                if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };
    // Main countdown interval (runs globally)
    useEffect(() => {
        let interval: number | undefined;
        if (isRunning && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((time) => {
                    if (time <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft]);
    // Sync state to API (throttled to 5 seconds to reduce network load)
    useEffect(() => {
        let syncInterval: number | undefined;
        if (isRunning && sessionId) {
            syncInterval = window.setInterval(async () => {
                const userId = user?.id;
                if (!isRunningRef.current || !sessionIdRef.current) return;
                const currentProgress = Math.round(
                    ((totalDurationRef.current - timeLeftRef.current) /
                        (totalDurationRef.current || 1)) *
                    100,
                );
                if (userId && sessionIdRef.current) {
                    await updateTimerSession(sessionIdRef.current, {
                        duration: Math.floor(totalDurationRef.current / 60),
                        status: "IN_PROGRESS",
                        currentProgress,
                    });
                }
            }, 5000);
        }
        return () => {
            if (syncInterval) clearInterval(syncInterval);
        };
    }, [isRunning, sessionId, user]);
    const handleStartPause = async () => {
        const userId = user?.id;
        if (!userId) {
            toast.error("Please log in to start a session");
            return;
        }
        if (!isRunning) {
            if (!sessionId) {
                const payload = {
                    duration: Math.floor(timeLeft / 60),
                    status: "NOT_STARTED" as FocusTimerStatus,
                    currentProgress: 0,
                };
                const res = await createTimerSession(payload);
                if (res.success) {
                    const newId = res.data?.id;
                    if (newId) {
                        setSessionId(newId);
                        sessionIdRef.current = newId;
                    }
                    setTotalDuration(timeLeft);
                    if (newId) {
                        await updateTimerSession(newId, {
                            ...payload,
                            status: "IN_PROGRESS",
                        });
                    }
                    fetchHistory(userId);
                }
            } else {
                await updateTimerSession(sessionId, {
                    duration: Math.floor(totalDuration / 60),
                    status: "IN_PROGRESS",
                    currentProgress: Math.round(
                        ((totalDuration - timeLeft) / (totalDuration || 1)) * 100,
                    ),
                });
            }
            setIsRunning(true);
        } else {
            setIsRunning(false);
            if (sessionId) {
                await updateTimerSession(sessionId, {
                    duration: Math.floor(totalDuration / 60),
                    status: "PAUSED",
                    currentProgress: Math.round(
                        ((totalDuration - timeLeft) / (totalDuration || 1)) * 100,
                    ),
                });
            }
        }
    };
    const handleComplete = async () => {
        setIsRunning(false);
        isRunningRef.current = false;
        setIsCompleted(true);
        const userId = user?.id;
        const currentSessionId = sessionId || sessionIdRef.current;
        if (currentSessionId) {
            setHistory((prev) =>
                prev.map((s) =>
                    s.id === currentSessionId ? { ...s, status: "COMPLETED" } : s,
                ),
            );
            setSessionId(null);
            sessionIdRef.current = null;
            await completeTimerSession(currentSessionId);
            if (userId) {
                setTimeout(() => fetchHistory(userId), 1500);
            }
        }
    };
    const handleReset = async () => {
        if (
            sessionId &&
            window.confirm(
                "Reset this session? This will remove your current progress.",
            )
        ) {
            await deleteTimerSession(sessionId);
            const userId = user?.id;
            if (userId) fetchHistory(userId);
        }
        setIsRunning(false);
        isRunningRef.current = false;
        setSessionId(null);
        sessionIdRef.current = null;
        const mins = parseInt(customMinutes) || 25;
        setTimeLeft(mins * 60);
        setTotalDuration(mins * 60);
        setIsCompleted(false);
    };
    const handleDeleteHistory = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        const res = await deleteTimerSession(id);
        if (res.success) {
            toast.success("Record deleted");
            const userId = user?.id;
            if (userId) fetchHistory(userId);
        }
    };
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    return (
        <FocusTimerContext.Provider
            value={{
                timeLeft,
                setTimeLeft,
                totalDuration,
                setTotalDuration,
                isRunning,
                setIsRunning,
                isCompleted,
                setIsCompleted,
                sessionId,
                setSessionId,
                customMinutes,
                setCustomMinutes,
                isInitializing,
                history,
                isLoadingHistory,
                page,
                setPage,
                totalPages,
                handleStartPause,
                handleReset,
                handleDeleteHistory,
                fetchHistory,
                formatTime,
            }}
        >
            {children}
        </FocusTimerContext.Provider>
    );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useFocusTimer() {
    const context = useContext(FocusTimerContext);
    if (context === undefined) {
        throw new Error("useFocusTimer must be used within a FocusTimerProvider");
    }
    return context;
}