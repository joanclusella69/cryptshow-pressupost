-- Mercha: permet deixar les unitats en blanc (producte nou o casella esborrada).
-- Abans la base de dades ho rebutjava i el canvi es perdia sense avisar.
alter table mercha alter column quantitat drop not null;
alter table mercha alter column total set default 0;
