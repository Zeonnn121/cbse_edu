"""
Supabase DB operations for storing/fetching chat history per user.

Table needed (run this SQL in Supabase → SQL Editor):

    create table chat_history (
        id          uuid default gen_random_uuid() primary key,
        user_id     uuid references auth.users(id) on delete cascade,
        question    text not null,
        answer      text not null,
        created_at  timestamptz default now()
    );

    alter table chat_history enable row level security;

    create policy "Users see own history"
        on chat_history for select
        using (auth.uid() = user_id);

    create policy "Users insert own history"
        on chat_history for insert
        with check (auth.uid() = user_id);


Optional table for quiz progress (run this SQL too):

    create table quiz_attempts (
        id          uuid default gen_random_uuid() primary key,
        user_id     uuid references auth.users(id) on delete cascade,
        score       int not null,
        total       int not null,
        breakdown   jsonb,
        created_at  timestamptz default now()
    );

    alter table quiz_attempts enable row level security;

    create policy "Users see own quiz attempts"
        on quiz_attempts for select
        using (auth.uid() = user_id);

    create policy "Users insert own quiz attempts"
        on quiz_attempts for insert
        with check (auth.uid() = user_id);


Optional table for thumbs up/down feedback (run this SQL too):

    create table chat_feedback (
        id               uuid default gen_random_uuid() primary key,
        user_id           uuid references auth.users(id) on delete cascade,
        chat_history_id   uuid references chat_history(id) on delete cascade,
        rating            smallint not null, -- 1 = thumbs up, -1 = thumbs down
        note              text,
        created_at        timestamptz default now()
    );

    alter table chat_feedback enable row level security;

    create policy "Users see own feedback"
        on chat_feedback for select
        using (auth.uid() = user_id);

    create policy "Users insert own feedback"
        on chat_feedback for insert
        with check (auth.uid() = user_id);
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

db: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def save_message(user_id: str, question: str, answer: str) -> str | None:
    """Insert a chat_history row and return its id when possible."""
    res = db.table("chat_history").insert({
        "user_id": user_id,
        "question": question,
        "answer": answer,
    }).execute()

    data = getattr(res, "data", None) or []
    if isinstance(data, list) and data:
        first = data[0] or {}
        if isinstance(first, dict):
            return first.get("id")
    return None


def save_feedback(
    user_id: str,
    chat_history_id: str,
    rating: int,
    note: str | None = None,
):
    db.table("chat_feedback").insert({
        "user_id": user_id,
        "chat_history_id": chat_history_id,
        "rating": rating,
        "note": note,
    }).execute()


from datetime import datetime, timedelta

def cleanup_old_history(user_id: str):
    """Delete chat history older than 10 days."""
    cutoff = datetime.utcnow() - timedelta(days=10)
    db.table("chat_history").delete().lt("created_at", cutoff).eq("user_id", user_id).execute()

def get_history(user_id: str, limit: int = 30) -> list[dict]:
    # Cleanup old history first
    cleanup_old_history(user_id)
    cutoff = datetime.utcnow() - timedelta(days=10)
    res = (
        db.table("chat_history")
        .select("id, question, answer, created_at")
        .eq("user_id", user_id)
        .gte("created_at", cutoff)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


def delete_history_item(user_id: str, history_id: str) -> bool:
    db.table("chat_history").delete().eq("id", history_id).eq("user_id", user_id).execute()
    return True


def get_question_count(user_id: str) -> int:
    res = (
        db.table("chat_history")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    return int(getattr(res, "count", 0) or 0)


def save_quiz_attempt(user_id: str, score: int, total: int, breakdown: dict | None = None):
    db.table("quiz_attempts").insert({
        "user_id": user_id,
        "score": score,
        "total": total,
        "breakdown": breakdown,
    }).execute()


def get_quiz_stats(user_id: str) -> dict:
    # If the table isn't created yet, caller will catch the error.
    attempts = (
        db.table("quiz_attempts")
        .select("score,total")
        .eq("user_id", user_id)
        .execute()
    )
    rows = attempts.data or []
    best = None
    for r in rows:
        s = r.get("score")
        if isinstance(s, int):
            best = s if best is None else max(best, s)
    return {"quiz_attempts": len(rows), "best_quiz_score": best}