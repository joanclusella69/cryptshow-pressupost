alter table moviments add column if not exists acreedor text;
alter table moviments add column if not exists pagat boolean default false;
