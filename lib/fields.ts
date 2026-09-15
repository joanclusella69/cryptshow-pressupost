// ─────────────────────────────────────────────────────────────
// PUNT ÚNIC ON DEFINEIXES L'ESTRUCTURA DE TOT EL PRESSUPOST.
// Quatre blocs, calcats de com ja treballes a l'Excel:
//   1. MOVIMENT_FIELDS   → Despeses i Ingressos generals (per partida)
//   2. ENTRADA_FIELDS    → Venda d'entrades (per dia/sessió)
//   3. MERCHA_FIELDS     → Venda de marxandatge (per dia/article)
//   4. PUBLICITAT_FIELDS → Anunciants i patrocinadors
//
// Per fer una variació d'estructura:
//   1. Afegeix/treu una entrada al bloc corresponent.
//   2. Afegeix la columna equivalent a Supabase (nova migració
//      numerada a supabase/migrations/).
// No cal tocar cap altre fitxer del projecte.
// ─────────────────────────────────────────────────────────────

export type FieldType = "text" | "number" | "date" | "select" | "boolean";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  width?: "full" | "auto";
}

export const EDICIONS = ["XXI (2027)", "XX (2026)", "XIX (2025)"];

// ── 1. Despeses i ingressos generals ───────────────────────────
export const CATEGORIES_DESPESA = [
  "Dietes organització",
  "Subministraments",
  "Comunicació i difusió",
  "Gestió sala projeccions",
  "Premis i trofeus",
  "Activitats i convidats",
  "Marxandatge (cost)",
  "Producció tècnica",
  "Gestió i administració (IRPF, web, quotes...)",
  "Altres despeses",
];

export const CATEGORIES_INGRES = [
  "Ajuntament",
  "Subvencions",
  "The Crypts Productions",
  "Aportació Cryptshow",
  "Publicitat i patrocinadors",
  "Entrades",
  "Marxandatge (venda)",
  "Plataformes (FilmFreeway/Festhome/Movibeta)",
  "Remanent any anterior",
  "Altres ingressos",
];

export const MOVIMENT_FIELDS: Field[] = [
  { key: "edicio", label: "Edició", type: "select", options: EDICIONS, required: true },
  { key: "data", label: "Data", type: "date", required: true },
  { key: "tipus", label: "Tipus", type: "select", options: ["ingres", "despesa"], required: true },
  { key: "categoria", label: "Categoria", type: "select", options: [], required: true }, // omplert dinàmicament segons tipus
  { key: "concepte", label: "Concepte", type: "text", required: true, width: "full" },
  { key: "previst", label: "Previst (€)", type: "number" },
  { key: "real", label: "Real (€)", type: "number", required: true },
  { key: "notes", label: "Notes", type: "text", width: "full" },
];

// ── 2. Entrades (venda de tiquets) ─────────────────────────────
export const ENTRADA_FIELDS: Field[] = [
  { key: "edicio", label: "Edició", type: "select", options: EDICIONS, required: true },
  { key: "dia", label: "Dia", type: "text", required: true }, // ex. "Dia 1"
  { key: "sessio", label: "Sessió", type: "text", required: true, width: "full" },
  { key: "caixa", label: "Caixa (€)", type: "number" },
  { key: "web", label: "Web (€)", type: "number" },
  { key: "notes", label: "Notes", type: "text", width: "full" },
];
// El "Total per sessió" es calcula automàticament (caixa + web), no cal introduir-lo.

// ── 3. Mercha (marxandatge) ────────────────────────────────────
export const ARTICLES_MERCHA = [
  "Samarretes",
  "Bosses",
  "Xapes",
  "Xapa petita",
  "Samarretes staff",
  "Bossa staff",
  "Samarreta anterior",
  "Altres",
];

export const MERCHA_FIELDS: Field[] = [
  { key: "edicio", label: "Edició", type: "select", options: EDICIONS, required: true },
  { key: "dia", label: "Dia", type: "text", required: true },
  { key: "article", label: "Article", type: "select", options: ARTICLES_MERCHA, required: true },
  { key: "quantitat", label: "Quantitat", type: "number", required: true },
  { key: "total", label: "Total (€)", type: "number", required: true },
  { key: "notes", label: "Notes", type: "text", width: "full" },
];

// ── 4. Publicitat / patrocinadors ──────────────────────────────
export const ESTATS_PUBLICITAT = ["Pendent demanar", "Demanat", "OK", "Igual que any anterior"];

export const PUBLICITAT_FIELDS: Field[] = [
  { key: "edicio", label: "Edició", type: "select", options: EDICIONS, required: true },
  { key: "anunciant", label: "Anunciant", type: "text", required: true, width: "full" },
  { key: "previst", label: "Previst (€)", type: "number" },
  { key: "confirmat", label: "Confirmat (€)", type: "number" },
  { key: "estat", label: "Estat", type: "select", options: ESTATS_PUBLICITAT },
  { key: "encarregat", label: "Encarregat/da", type: "text" },
  { key: "cobrat", label: "Cobrat", type: "boolean" },
  { key: "facturacio", label: "Facturació (€)", type: "number" },
];
