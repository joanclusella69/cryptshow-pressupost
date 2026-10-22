-- Dies de l'apartat Entrades (Previ, Dia 1, Dia 2...). L'ordre es controla
-- amb la columna "ordre" perquè es puguin reordenar lliurement.
create table if not exists entrades_dies (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  nom text not null,
  ordre int not null default 0,
  te_abonaments boolean not null default true,
  abonament_unitats numeric(10, 2) default 0,
  abonament_preu numeric(10, 2) default 8,
  created_at timestamptz not null default now()
);
create index if not exists entrades_dies_edicio_idx on entrades_dies (edicio);

-- Sessions dins de cada dia.
create table if not exists entrades_sessions (
  id uuid primary key default gen_random_uuid(),
  dia_id uuid not null references entrades_dies(id) on delete cascade,
  nom text,
  preu_taquilla numeric(10, 2),
  preu_web numeric(10, 2),
  unitats_taquilla numeric(10, 2),
  unitats_web numeric(10, 2),
  boost_abonament boolean not null default false,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists entrades_sessions_dia_idx on entrades_sessions (dia_id);

-- Abonament Tot Festival: una sola fitxa per edició (no lligada a cap dia).
create table if not exists entrades_config (
  id uuid primary key default gen_random_uuid(),
  edicio text not null unique,
  festival_unitats numeric(10, 2) default 0,
  festival_preu numeric(10, 2) default 25
);

-- Referències de l'any anterior, editables des de la mateixa pantalla
-- (clau lliure: "dia:Dia 1", "dia:Dia 1|sessio:Nom", "abonament_festival"...).
create table if not exists referencies_2026 (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  clau text not null,
  valor numeric(10, 2),
  unique (edicio, clau)
);

alter table entrades_dies enable row level security;
alter table entrades_sessions enable row level security;
alter table entrades_config enable row level security;
alter table referencies_2026 enable row level security;

drop policy if exists "Permet tot amb anon key" on entrades_dies;
create policy "Permet tot amb anon key" on entrades_dies for all using (true) with check (true);
drop policy if exists "Permet tot amb anon key" on entrades_sessions;
create policy "Permet tot amb anon key" on entrades_sessions for all using (true) with check (true);
drop policy if exists "Permet tot amb anon key" on entrades_config;
create policy "Permet tot amb anon key" on entrades_config for all using (true) with check (true);
drop policy if exists "Permet tot amb anon key" on referencies_2026;
create policy "Permet tot amb anon key" on referencies_2026 for all using (true) with check (true);
