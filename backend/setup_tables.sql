-- Run this in Supabase Dashboard → SQL Editor → Run
-- Idempotent: Skips existing tables/policies (chat_history exists).
-- Creates missing chat_feedback + policies.

-- Safe drop policies only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_history') THEN
    DROP POLICY IF EXISTS "Users see own history" ON chat_history;
    DROP POLICY IF EXISTS "Users insert own history" ON chat_history;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_feedback') THEN
    DROP POLICY IF EXISTS "Users see own feedback" ON chat_feedback;
    DROP POLICY IF EXISTS "Users insert own feedback" ON chat_feedback;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_attempts') THEN
    DROP POLICY IF EXISTS "Users see own quiz attempts" ON quiz_attempts;
    DROP POLICY IF EXISTS "Users insert own quiz attempts" ON quiz_attempts;
  END IF;
END $$;

-- Chat history table (exists)
CREATE TABLE IF NOT EXISTS chat_history (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    question    text NOT NULL,
    answer      text NOT NULL,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback table (likely missing)
CREATE TABLE IF NOT EXISTS chat_feedback (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_history_id   uuid REFERENCES chat_history(id) ON DELETE CASCADE,
    rating            smallint NOT NULL,
    note              text,
    created_at        timestamptz DEFAULT now()
);

ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own feedback" ON chat_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own feedback" ON chat_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    score       int NOT NULL,
    total       int NOT NULL,
    breakdown   jsonb,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT 'Setup complete - Tables & policies ready' AS status;
SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('chat_history','chat_feedback','quiz_attempts');

