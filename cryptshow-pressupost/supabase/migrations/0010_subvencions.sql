-- Marca a cada moviment de despesa si va a la memòria econòmica de subvencions,
-- més els camps que només calen per a la memòria (Base, IVA, IRPF).
alter table moviments add column if not exists subvencio boolean not null default false;
alter table moviments add column if not exists subv_base numeric(10, 2);
alter table moviments add column if not exists subv_iva numeric(10, 2);
alter table moviments add column if not exists subv_irpf numeric(10, 2);

-- Ingressos de la memòria de subvencions (llista lliure, no ve de Proveïdors).
create table if not exists subvencions_ingressos (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  concepte text not null,
  import numeric(10, 2) default 0,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists subvencions_ingressos_edicio_idx on subvencions_ingressos (edicio);

alter table subvencions_ingressos enable row level security;
drop policy if exists "Permet tot amb anon key" on subvencions_ingressos;
create policy "Permet tot amb anon key" on subvencions_ingressos for all using (true) with check (true);
