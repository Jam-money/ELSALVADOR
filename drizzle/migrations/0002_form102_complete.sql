alter table public.birth_records
  add column if not exists reg_province text,
  add column if not exists reg_city text,
  add column if not exists multiple_birth_order text,
  add column if not exists mother_children_dead integer,
  add column if not exists mother_country text,
  add column if not exists father_country text,
  add column if not exists parents_marriage_country text,
  add column if not exists attendant_other text,
  add column if not exists attendant_title text,
  add column if not exists attendant_address text,
  add column if not exists attendant_cert_date date,
  add column if not exists informant_date date,
  add column if not exists prepared_by_name text,
  add column if not exists prepared_by_title text,
  add column if not exists prepared_by_date date,
  add column if not exists received_by_name text,
  add column if not exists received_by_title text,
  add column if not exists received_by_date date,
  add column if not exists registered_by_name text,
  add column if not exists registered_by_title text,
  add column if not exists registered_by_date date;

create table public.paternity_affidavits (
  id uuid primary key default gen_random_uuid(),
  birth_record_id uuid references public.birth_records(id) on delete set null,
  registry_number text,
  father_name text not null,
  mother_name text not null,
  child_name text not null,
  child_birth_date date not null,
  child_birth_place text not null,
  sworn_date date not null,
  id_number text,
  id_issued_on date,
  id_issued_at text,
  officer_name text,
  officer_position text,
  officer_address text,
  encoded_by uuid,
  created_at timestamptz not null default now()
);

create table public.delayed_registration_affidavits (
  id uuid primary key default gen_random_uuid(),
  birth_record_id uuid references public.birth_records(id) on delete set null,
  registry_number text,
  affiant_name text not null,
  civil_status text,
  residence_address text,
  applicant_for text not null check (applicant_for in ('self','other')),
  subject_name text,
  birth_place text,
  birth_date date,
  attendant_name text,
  attendant_address text,
  citizenship text,
  parents_married boolean,
  parents_marriage_date date,
  parents_marriage_place text,
  father_acknowledged boolean,
  father_name text,
  delay_reason text,
  married_to text,
  relationship_to_owner text,
  execution_date date,
  execution_place text,
  sworn_date date,
  sworn_place text,
  id_number text,
  id_issued_on date,
  id_issued_at text,
  officer_name text,
  officer_position text,
  officer_address text,
  encoded_by uuid,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.paternity_affidavits, public.delayed_registration_affidavits to authenticated;
grant all on public.paternity_affidavits, public.delayed_registration_affidavits to service_role;

alter table public.paternity_affidavits enable row level security;
alter table public.delayed_registration_affidavits enable row level security;

do $$ declare t text; begin
  foreach t in array array['paternity_affidavits','delayed_registration_affidavits'] loop
    execute format('create policy "staff read" on public.%I for select to authenticated using (public.is_staff(auth.uid()))', t);
    execute format('create policy "encoders insert" on public.%I for insert to authenticated with check (public.can_encode(auth.uid()))', t);
    execute format('create policy "validators update" on public.%I for update to authenticated using (public.can_validate(auth.uid()) or public.can_encode(auth.uid()))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create or replace function public.audit_generic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs (user_id, action, entity, entity_id, details)
  values (auth.uid(), lower(tg_op), tg_argv[0], coalesce(new.id, old.id), jsonb_build_object('table', tg_table_name));
  return coalesce(new, old);
end; $$;

create trigger paternity_audit after insert or update or delete on public.paternity_affidavits
  for each row execute function public.audit_generic('paternity_affidavit');
create trigger delayed_audit after insert or update or delete on public.delayed_registration_affidavits
  for each row execute function public.audit_generic('delayed_registration_affidavit');
