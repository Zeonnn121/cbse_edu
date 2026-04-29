 Database Setup - Fix Feedback Error & Chat History

## Step 0: Setup Supabase Tables (REQUIRED before testing history/feedback)
- [ ] 1. Open backend/setup_tables.sql
- [ ] 2. Copy ALL content → Supabase Project Dashboard → SQL Editor (top menu) → Paste → RUN
- [ ] 3. Verify: Run `SELECT * FROM chat_feedback;` (should no error)
- [ ] 4. Restart backend: Ctrl+C then `uvicorn backend.main:app --reload --port 8000`
- [ ] 5. Test: Login → Ask a question → Open history sidebar (should show Q&A) → Thumbs up/down (no WARN in console)

This fixes:
- [WARN] Failed to save feedback (chat_feedback table missing)
- Chat history empty → now saves/fetches correctly

## Previous Tasks
# Implementation Plan for Features: Curiosity Questions & 10-Day History Expiry

## Step 1: Backend Changes (database.py & main.py)
- [x] Edit `backend/database.py`: Add 10-day filter to `get_history()`, add `cleanup_old_history()` function.
- [x] Edit `backend/main.py`: Add `/api/curiosity/{history_id}` endpoint using RAG to generate 3 context-specific follow-ups.

## Step 2: Frontend API Update
- [x] Edit `frontend/src/lib/api.js`: Add `getCuriosity(historyId)` function.

## Step 3: Frontend UI Updates
- [x] Edit `frontend/src/pages/chat/AskTab.jsx`: Add UI for 3 curiosity buttons below bot messages.
- [x] Edit `frontend/src/pages/chat/HistorySidebar.jsx`: Add privacy notice ("Chats auto-delete after 10 days") and optional delete button.
- [x] Edit `frontend/src/pages/Chat.jsx`: Pass curiosity data to AskTab.

## Step 4: Testing & Verification
- [ ] Restart backend, test `/api/history` (filter), `/api/curiosity`.
- [ ] Frontend: Send question → verify suggestions appear, history shows notice.
- [ ] Attempt completion.

**Notes**: Context-specific curiosity (based on Q&A). Lazy deletion on history fetch. No new deps/Schema changes.

