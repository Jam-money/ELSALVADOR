alter type public.record_status add value if not exists 'returned';

alter table public.birth_records
  add column if not exists return_reason text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz;

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_active_at timestamptz;

create policy "admin update profiles" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.guard_birth_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and not public.can_validate(auth.uid())
     and new.status not in ('for_validation','draft') then
    raise exception 'Only a registrar or admin can approve, amend, return or cancel records';
  end if;
  return new;
end; $$;

create trigger birth_status_guard before update on public.birth_records
  for each row execute function public.guard_birth_status();
