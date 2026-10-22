-- Publicitat: documentació (Cap/Rebut/Factura) i dades de la factura.
alter table publicitat add column if not exists documentacio text default 'Cap';
alter table publicitat add column if not exists factura_nom_fiscal text;
alter table publicitat add column if not exists factura_nif_cif text;
alter table publicitat add column if not exists factura_adreca text;
alter table publicitat add column if not exists factura_concepte text;
alter table publicitat add column if not exists factura_import numeric(10, 2);
alter table publicitat add column if not exists factura_data date;

-- Apartat "Cryptshow": línies lliures d'altres ingressos propis
-- (Entrades i Mercha ja tenen les seves pròpies taules; aquesta és
-- només per a ingressos que no encaixen ni a Entrades ni a Mercha).
create table if not exists cryptshow_altres (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  nom text not null,
  import numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists cryptshow_altres_edicio_idx on cryptshow_altres (edicio);

alter table cryptshow_altres enable row level security;
drop policy if exists "Permet tot amb anon key" on cryptshow_altres;
create policy "Permet tot amb anon key" on cryptshow_altres for all using (true) with check (true);
