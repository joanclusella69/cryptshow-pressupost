-- El "previst" passa a ser un valor per categoria+edició (com al teu Excel:
-- una xifra pressupostada per partida), no un camp de cada transacció.
-- Els moviments reals se sumen automàticament per calcular el "real" de cada categoria.

alter table moviments drop column if exists previst;

create table if not exists previstos (
  id uuid primary key default gen_random_uuid(),
  edicio text not null,
  tipus text not null check (tipus in ('ingres', 'despesa')),
  categoria text not null,
  previst numeric(10, 2) not null default 0,
  unique (edicio, tipus, categoria)
);

alter table previstos enable row level security;
drop policy if exists "Permet tot amb anon key" on previstos;
create policy "Permet tot amb anon key" on previstos for all using (true) with check (true);
