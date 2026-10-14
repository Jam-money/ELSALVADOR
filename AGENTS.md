# Project rules

- Data access uses the browser Supabase client with RLS; role checks live in SQL helpers (has_role, is_staff, can_encode, can_validate) so permissions are enforced in the database.
- Roles live only in public.user_roles; the first signup becomes admin, later signups default to encoder (handle_new_user trigger).
- Staff pages live under src/routes/_authenticated/ (client-only gate redirecting to /auth); the sidebar shell is in its route.tsx.
- Record changes are audited by DB triggers into public.audit_logs, not by app code, so no path can skip logging.
