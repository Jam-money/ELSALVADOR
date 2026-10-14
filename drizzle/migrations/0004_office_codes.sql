alter table public.birth_records
  add column if not exists office_code_8 text,
  add column if not exists office_code_9 text,
  add column if not exists office_code_11 text,
  add column if not exists office_code_13 text,
  add column if not exists office_code_15 text,
  add column if not exists office_code_16 text,
  add column if not exists office_code_17 text,
  add column if not exists office_code_19 text;
