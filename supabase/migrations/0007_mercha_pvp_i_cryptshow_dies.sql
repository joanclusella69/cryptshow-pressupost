-- Mercha: preu unitari (PVP) per calcular el total automàticament.
alter table mercha add column if not exists pvp numeric(10, 2);

-- Permet "upsert" per dia+producte (evita duplicats en editar la mateixa fila).
create unique index if not exists mercha_edicio_dia_article_key on mercha (edicio, dia, article);

-- Apartat Cryptshow: una fila per dia, amb els totals ràpids d'Entrades i Mercha.
create table if not exists cryptshow_dies (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  nom text not null,
  entrades numeric(10, 2) not null default 0,
  mercha numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists cryptshow_dies_edicio_idx on cryptshow_dies (edicio);

alter table cryptshow_dies enable row level security;
drop policy if exists "Permet tot amb anon key" on cryptshow_dies;
create policy "Permet tot amb anon key" on cryptshow_dies for all using (true) with check (true);
