-- Taula principal de moviments de pressupost.
-- Correspon 1:1 amb MOVIMENT_FIELDS a lib/fields.ts.
-- Si afegeixes un camp allà, afegeix aquí la columna equivalent
-- amb "alter table moviments add column ...".

create extension if not exists "pgcrypto";

create table if not exists moviments (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  data date not null,
  tipus text not null check (tipus in ('ingres', 'despesa')),
  categoria text not null,
  concepte text not null,
  import numeric(10, 2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists moviments_edicio_idx on moviments (edicio);
create index if not exists moviments_data_idx on moviments (data);

alter table moviments enable row level security;

-- Política MVP: l'aplicació (amb la clau "anon") pot llegir i escriure.
-- La protecció d'accés es fa amb la contrasenya de SITE_PASSWORD, no aquí.
-- Si en el futur hi ha usuaris amb login (Supabase Auth), substitueix
-- aquesta política per una que comprovi auth.uid().
drop policy if exists "Permet tot amb anon key" on moviments;
create policy "Permet tot amb anon key" on moviments
  for all
  using (true)
  with check (true);
