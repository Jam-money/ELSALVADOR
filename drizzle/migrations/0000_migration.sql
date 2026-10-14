create type public.app_role as enum ('admin','registrar','encoder','viewer');
create type public.record_status as enum ('draft','for_validation','registered','amended','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  position text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id) $$;

create or replace function public.can_encode(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','registrar','encoder')) $$;

create or replace function public.can_validate(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','registrar')) $$;

create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()) or id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'encoder');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.birth_records (
  id uuid primary key default gen_random_uuid(),
  registry_number text unique,
  child_first_name text not null,
  child_middle_name text,
  child_last_name text not null,
  sex text not null check (sex in ('Male','Female')),
  date_of_birth date not null,
  place_of_birth text not null,
  mother_name text not null,
  father_name text,
  date_registered date not null default current_date,
  status record_status not null default 'for_validation',
  remarks text,
  encoded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.marriage_records (
  id uuid primary key default gen_random_uuid(),
  registry_number text unique,
  husband_name text not null,
  wife_name text not null,
  date_of_marriage date not null,
  place_of_marriage text not null,
  date_registered date not null default current_date,
  status record_status not null default 'for_validation',
  encoded_by uuid,
  created_at timestamptz not null default now()
);
create table public.death_records (
  id uuid primary key default gen_random_uuid(),
  registry_number text unique,
  deceased_name text not null,
  sex text not null check (sex in ('Male','Female')),
  date_of_death date not null,
  place_of_death text not null,
  cause_of_death text,
  date_registered date not null default current_date,
  status record_status not null default 'for_validation',
  encoded_by uuid,
  created_at timestamptz not null default now()
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_type text not null,
  requester_name text not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','cancelled')),
  amount numeric(10,2) not null default 0,
  handled_by uuid,
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.birth_records, public.marriage_records, public.death_records, public.transactions to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant all on public.birth_records, public.marriage_records, public.death_records, public.transactions, public.audit_logs to service_role;

alter table public.birth_records enable row level security;
alter table public.marriage_records enable row level security;
alter table public.death_records enable row level security;
alter table public.transactions enable row level security;
alter table public.audit_logs enable row level security;

do $$ declare t text; begin
  foreach t in array array['birth_records','marriage_records','death_records','transactions'] loop
    execute format('create policy "staff read" on public.%I for select to authenticated using (public.is_staff(auth.uid()))', t);
    execute format('create policy "encoders insert" on public.%I for insert to authenticated with check (public.can_encode(auth.uid()))', t);
    execute format('create policy "validators update" on public.%I for update to authenticated using (public.can_validate(auth.uid()) or public.can_encode(auth.uid()))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;
create policy "admin read audit" on public.audit_logs for select to authenticated using (public.can_validate(auth.uid()));
create policy "staff write audit" on public.audit_logs for insert to authenticated with check (user_id = auth.uid());

create or replace function public.audit_birth()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs (user_id, action, entity, entity_id, details)
  values (auth.uid(), lower(tg_op), 'birth_record', coalesce(new.id, old.id),
    jsonb_build_object('registry_number', coalesce(new.registry_number, old.registry_number), 'status', coalesce(new.status, old.status)));
  if tg_op = 'UPDATE' then new.updated_at = now(); end if;
  return coalesce(new, old);
end; $$;
create trigger birth_audit_ins after insert or delete on public.birth_records for each row execute function public.audit_birth();
create trigger birth_audit_upd before update on public.birth_records for each row execute function public.audit_birth();

