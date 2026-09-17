-- Carrega el "previst" de l'edició XXI (2027), agafant els imports
-- reals del 2026 com a referència (revisats i confirmats per Joan).

insert into previstos (edicio, tipus, categoria, previst) values
  ('XXI (2027)', 'despesa', 'Dietes organització', 140.00),
  ('XXI (2027)', 'despesa', 'Subministraments', 91.86),
  ('XXI (2027)', 'despesa', 'Comunicació i difusió', 1968.68),
  ('XXI (2027)', 'despesa', 'Gestió i administració (IRPF, web, quotes...)', 300.00),
  ('XXI (2027)', 'despesa', 'Activitats i convidats', 3267.85),
  ('XXI (2027)', 'despesa', 'Gestió sala projeccions', 3020.00),
  ('XXI (2027)', 'despesa', 'Premis i trofeus', 866.00),
  ('XXI (2027)', 'ingres', 'Ajuntament', 2000.00),
  ('XXI (2027)', 'ingres', 'The Crypts Productions', 1500.00),
  ('XXI (2027)', 'ingres', 'Aportació Cryptshow', 2594.75),
  ('XXI (2027)', 'ingres', 'Publicitat i patrocinadors', 2095.00),
  ('XXI (2027)', 'ingres', 'Plataformes (FilmFreeway/Festhome/Movibeta)', 670.00)
on conflict (edicio, tipus, categoria) do update set previst = excluded.previst;
