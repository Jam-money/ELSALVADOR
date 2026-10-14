<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Data access uses the browser Supabase client with RLS; role checks live in SQL helpers (has_role, is_staff, can_encode, can_validate) so permissions are enforced in the database.
- Roles live only in public.user_roles; the first signup becomes admin, later signups default to encoder (handle_new_user trigger).
- Staff pages live under src/routes/_authenticated/ (client-only gate redirecting to /auth); the sidebar shell is in its route.tsx.
- Record changes are audited by DB triggers into public.audit_logs, not by app code, so no path can skip logging.
