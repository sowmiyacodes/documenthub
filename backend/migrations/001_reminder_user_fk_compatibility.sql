-- The application authenticates users against public.users with its own JWTs.
-- Keep reminder/settings ownership aligned with that identity; the backend
-- service-role client bypasses RLS and every endpoint applies an owner filter.
ALTER TABLE public.reminders
    DROP CONSTRAINT IF EXISTS reminders_user_id_fkey;

ALTER TABLE public.reminders
    ADD CONSTRAINT reminders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_settings
    DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_ai_document_date_type
    ON public.reminders (document_id, due_date, reminder_type)
    WHERE source = 'ai';
