-- Amplia l'estructura inicial (0001) per reflectir els 4 blocs
-- reals del pressupost de Cryptshow: moviments generals, entrades,
-- mercha i publicitat. Correspon 1:1 amb lib/fields.ts.

-- 1. Moviments generals: afegim "previst" i renombrem "import" -> "real"
alter table moviments add column if not exists previst numeric(10, 2);
alter table moviments rename column import to real;

-- 2. Entrades (venda de tiquets per dia/sessió)
create table if not exists entrades (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  dia text not null,
  sessio text not null,
  caixa numeric(10, 2) default 0,
  web numeric(10, 2) default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists entrades_edicio_idx on entrades (edicio);

alter table entrades enable row level security;
drop policy if exists "Permet tot amb anon key" on entrades;
create policy "Permet tot amb anon key" on entrades for all using (true) with check (true);

-- 3. Mercha (venda de marxandatge per dia/article)
create table if not exists mercha (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  dia text not null,
  article text not null,
  quantitat numeric(10, 2) not null,
  total numeric(10, 2) not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists mercha_edicio_idx on mercha (edicio);

alter table mercha enable row level security;
drop policy if exists "Permet tot amb anon key" on mercha;
create policy "Permet tot amb anon key" on mercha for all using (true) with check (true);

-- 4. Publicitat (anunciants i patrocinadors)
create table if not exists publicitat (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  anunciant text not null,
  previst numeric(10, 2),
  confirmat numeric(10, 2),
  estat text,
  encarregat text,
  cobrat boolean default false,
  facturacio numeric(10, 2),
  created_at timestamptz not null default now()
);
create index if not exists publicitat_edicio_idx on publicitat (edicio);

alter table publicitat enable row level security;
drop policy if exists "Permet tot amb anon key" on publicitat;
create policy "Permet tot amb anon key" on publicitat for all using (true) with check (true);
