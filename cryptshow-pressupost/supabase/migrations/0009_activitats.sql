-- Conceptes de cada fitxa d'activitat (LMPV, Festival Convidat, Jornada
-- Literària, Pel·lícula Musicada, Sessió Asiàtica...). Els conceptes fixos
-- tenen editable=false (nom bloquejat); els "Altres" afegits per l'usuari
-- tenen editable=true.
create table if not exists activitats_conceptes (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  fitxa text not null,
  nom text not null,
  previst numeric(10, 2) default 0,
  real numeric(10, 2) default 0,
  editable boolean not null default false,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists activitats_conceptes_edicio_idx on activitats_conceptes (edicio);

-- Convidats del Jurat (Transport/Allotjament/Dietes, només Real).
create table if not exists activitats_jurat_convidats (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  nom text not null,
  transport_real numeric(10, 2) default 0,
  allotjament_real numeric(10, 2) default 0,
  dietes_real numeric(10, 2) default 0,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists activitats_jurat_edicio_idx on activitats_jurat_convidats (edicio);

-- El "Previst" únic del Jurat (una xifra global per la fitxa, no per convidat).
create table if not exists activitats_config (
  id uuid primary key default gen_random_uuid(),
  edicio text not null unique,
  jurat_previst numeric(10, 2) default 0
);

alter table activitats_conceptes enable row level security;
alter table activitats_jurat_convidats enable row level security;
alter table activitats_config enable row level security;

drop policy if exists "Permet tot amb anon key" on activitats_conceptes;
create policy "Permet tot amb anon key" on activitats_conceptes for all using (true) with check (true);
drop policy if exists "Permet tot amb anon key" on activitats_jurat_convidats;
create policy "Permet tot amb anon key" on activitats_jurat_convidats for all using (true) with check (true);
drop policy if exists "Permet tot amb anon key" on activitats_config;
create policy "Permet tot amb anon key" on activitats_config for all using (true) with check (true);
