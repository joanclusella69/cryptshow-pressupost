# Cryptshow · Pressupost

Eina web pròpia per gestionar el pressupost del festival, amb base de dades real
(Supabase) i estructura pensada per anar-la ajustant amb el temps.

## Estructura del projecte

- **`lib/fields.ts`** → el fitxer clau. Defineix els 4 blocs del pressupost
  (Moviments generals, Entrades, Mercha, Publicitat) i les seves categories.
  Totes les variacions d'estructura comencen aquí.
- **`supabase/migrations/`** → l'SQL que crea les taules a Supabase, numerat
  cronològicament. No modifiquis una migració ja aplicada: crea'n una de nova.
- **`lib/supabaseClient.ts`** → connexió amb la base de dades.
- **`app/`** i **`components/`** → les pantalles (es generaran al següent pas).

## Posada en marxa

1. Crea un projecte a [supabase.com](https://supabase.com).
2. A l'editor SQL de Supabase, executa (en aquest ordre) el contingut de
   `supabase/migrations/0001_init.sql` i després `0002_blocs_pressupost.sql`.
3. Copia `.env.local.example` com a `.env.local` i omple `NEXT_PUBLIC_SUPABASE_URL`
   i `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a Supabase: *Project Settings → API*).
4. Puja el projecte a GitHub i importa'l a [vercel.com](https://vercel.com).
5. A Vercel, afegeix les mateixes variables d'entorn del pas 3 abans de publicar.

## Fer una edició nova cada any

No cal crear cap plantilla nova. Afegeix l'edició corresponent a la llista
`EDICIONS` de `lib/fields.ts` i ja apareixerà com a opció al desplegable.

## Fer una variació d'estructura

1. Edita el bloc corresponent a `lib/fields.ts` (afegeix, treu o renombra un camp).
2. Crea una nova migració a `supabase/migrations/` amb l'`alter table` necessari.
3. Executa la migració a Supabase.

La resta del codi (formularis, taules) es genera automàticament a partir
d'aquesta configuració.
