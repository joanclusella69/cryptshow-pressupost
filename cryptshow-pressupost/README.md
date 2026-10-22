# Cryptshow · Pressupost

Eina web pròpia per gestionar el pressupost del Cryptshow Festival: Next.js (App Router) + Supabase (base de dades) + Vercel (allotjament).

## Pàgines (menú)

| Pàgina | Què fa |
|---|---|
| **Resum** | Bloc *Previst* i bloc *Real* (Ingressos, Despeses i Balanç) per edició. |
| **Despeses i ingressos** | Resum per categoria (previst / real / diferència). El previst i el real dels ingressos manuals són editables. |
| **Proveïdors** | On s'introdueixen les despeses reals per categoria (concepte, proveïdor, import, casella *pagat* i casella *Subv.*). La fitxa "Activitats i convidats" mostra a més les línies automàtiques d'Activitats. |
| **Activitats i convidats** | Fitxes LMPV, Festival Convidat, Jornada Literària, Pel·lícula Musicada, Sessió Asiàtica i Jurat, amb els seus conceptes (previst / real). |
| **Entrades** | Dies reordenables amb sessions (taquilla/web: unitats × preu), abonaments per dia, Abonament Tot Festival i comparativa amb l'any anterior (cel·les editables). |
| **Mercha** | Fitxa per dia amb tots els productes (unitats × PVP) i comparativa 2026/2027. |
| **Cryptshow** | Total Entrades + Total Mercha + línies lliures "Altres". |
| **Publicitat** | Fitxes d'esponsors (previst, confirmat, cobrat, factura imprimible). |
| **Subvencions** | Memòria econòmica: despeses (factures marcades "Subv." a Proveïdors, amb Base/IVA/IRPF manuals) i ingressos lliures. Es pot descarregar com a PDF. |

## Com s'alimenten els totals entre pàgines

- **Aportació Cryptshow** (Ingressos) = total d'Entrades + total de Mercha + "Altres" de Cryptshow.
- **Publicitat i patrocinadors** (Ingressos) = suma del *confirmat* només de les fitxes marcades com a **cobrat**.
- **Activitats i convidats** (Despeses) = totals reals de les fitxes d'Activitats + els proveïdors afegits a mà a Proveïdors.
- **Subvencions** llegeix les despeses de Proveïdors marcades amb "Subv."; el Total ve de Proveïdors, Base/IVA/IRPF s'escriuen a Subvencions.
- **Resum**: *Ingressos* ja suma totes les partides (manuals + Aportació Cryptshow + Publicitat cobrada).

## Posada en marxa

1. Crea un projecte a [supabase.com](https://supabase.com).
2. A l'SQL Editor de Supabase, executa **en ordre** tots els fitxers de `supabase/migrations/` (de `0001` a `0010`). Cada migració només s'executa una vegada.
3. Copia `.env.local.example` com a `.env.local` i omple `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase: *Project Settings → API Keys*, la clau *publishable*; mai la *secret*).
4. Puja el projecte a GitHub i importa'l a [vercel.com](https://vercel.com). A Vercel, afegeix les dues variables d'entorn abans de fer *Deploy*.

## Migracions

| # | Contingut |
|---|---|
| 0001 | Taula `moviments` |
| 0002 | Taules `entrades`, `mercha`, `publicitat` (versions inicials) |
| 0003 | Taula `previstos` (previst per categoria) |
| 0004 | Previst 2027 carregat des del real 2026 |
| 0005 | Camps de factura a `publicitat` + `cryptshow_altres` |
| 0006 | Camps `acreedor` i `pagat` a `moviments` |
| 0007 | PVP a `mercha` + `cryptshow_dies` |
| 0008 | Estructura d'Entrades (`entrades_dies`, `entrades_sessions`, `entrades_config`, `referencies_2026`) |
| 0009 | Activitats (`activitats_conceptes`, `activitats_jurat_convidats`, `activitats_config`) |
| 0010 | Subvencions (camps `subv_*` a `moviments` + `subvencions_ingressos`) |

> Si el teu projecte de Supabase ja existeix, **només cal executar les migracions que et falten**. No repeteixis les ja aplicades.

## Fer una edició nova

Afegeix-la a la llista `EDICIONS` de `lib/fields.ts` (la primera és la que es mostra per defecte). La primera vegada que s'obre cada pàgina per a l'edició nova, es creen soles les fitxes inicials (dies d'Entrades, sessions, esponsors, activitats...).

## Fer variacions d'estructura

- Categories de despesa/ingrés i llistes: `lib/fields.ts`.
- Qualsevol camp nou de base de dades: una nova migració numerada a `supabase/migrations/`.
- Les crides a Supabase que no s'esperen amb `await` han de portar `.then(() => {})`; si no, la petició no s'arriba a enviar.

## Pendent (llista de millores acordades)

- Símbol € dins de totes les caselles monetàries.
- Augmentar la mida general de la lletra.
- Entrades: crear nous tipus d'abonament triant preu i sessions afectades (entrades i valor).
- Que tots els previstos siguin editables.
- Publicitat: caselles que sobresurten de la fitxa.
- Endpoint per publicar el pressupost a la web oficial (previst sempre; real quan s'activi).
