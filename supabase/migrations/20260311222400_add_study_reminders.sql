-- Add study_reminders to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_reminders BOOLEAN NOT NULL DEFAULT false;
