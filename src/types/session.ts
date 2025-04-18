import { FieldValue } from "firebase/firestore";
import { ActionType } from "@/data/actions";

export type SessionState = "focus" | "break" | "complete" | "complete_and_reviewed";

export interface Session {
    id: string;
    user_id: string;
    break_end_time: string | null;
    break_minutes_remaining: number;
    break_start_time: string | null;
    focus_end_time: string | null;
    focus_start_time: string | null;
    planned_minutes: number;
    session_state: SessionState | null;
    total_minutes_done: number | null;
    createdAt: FieldValue;
    selected_actions?: ActionType[];
}

export interface SessionInsert {
    break_end_time?: string | null;
    break_minutes_remaining?: number;
    break_start_time?: string | null;
    focus_end_time?: string | null;
    focus_start_time?: string | null;
    id?: string;
    planned_minutes?: number;
    session_state?: SessionState | null;
    total_minutes_done?: number | null;
    user_id?: string;
    createdAt?: FieldValue;
    selected_actions?: ActionType[];
}

export interface SessionUpdate {
    break_end_time?: string | null;
    break_minutes_remaining?: number;
    break_start_time?: string | null;
    focus_end_time?: string | null;
    focus_start_time?: string | null;
    id?: number;
    planned_minutes?: number;
    session_state?: SessionState | null;
    total_minutes_done?: number | null;
    user_id?: string;
    selected_actions?: ActionType[];
}

export interface TimerLocationState {
    durationHours: number;
    level: string;
    taskId?: string;
    taskName?: string;
} 