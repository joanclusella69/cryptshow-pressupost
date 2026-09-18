"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES_MERCHA } from "@/lib/fields";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// Totals reals del 2026 per article (calculats des del full Excel original).
const REFERENCIA_2026: Record<string, number> = {
  "Samarretes": 443,
  "Bosses": 96,
  "Xapes": 3,
  "Xapa petita": 4,
  "Samarretes staff": 60,
  "Bossa staff": 5,
  "Samarreta anterior": 50,
  "Bossa anterior": 0,
};

function DiaGroup({
  dia,
  linies,
  onRefresh,
}: {
  dia: string;
  linies: any[];
  onRefresh: () => void;
}) {
  const [nouArticle, setNouArticle] = useState(ARTICLES_MERCHA[0]);
  const [novaQuantitat, setNovaQuantitat] = useState("");
  const [nouTotal, setNouTotal] = useState("");
  const [editantData, setEditantData] = useState(false);

  const totalDia = linies.reduce((s, l) => s + Number(l.total || 0), 0);
  const edicio = linies[0]?.edicio;

  const afegirLinia = async () => {
    if (!nouTotal) return;
    await supabase.from("mercha").insert({
      edicio,
      dia,
      article: nouArticle,
      quantitat: novaQuantitat ? Number(novaQuantitat) : null,
      total: Number(nouTotal),
    });
    setNovaQuantitat("");
    setNouTotal("");
    onRefresh();
  };

  const eliminarLinia = async (id: string) => {
    await supabase.from("mercha").delete().eq("id", id);
    onRefresh();
  };

  const canviarData = async (novaData: string) => {
    await supabase.from("mercha").update({ dia: novaData }).eq("dia", dia).eq("edicio", edicio);
    setEditantData(false);
    onRefresh();
  };

  return (
    <div className="card">
      <div className="card-top">
        {editantData ? (
          <input
            autoFocus
            type="date"
            defaultValue={dia}
            className="dia-nom"
            onBlur={(e) => canviarData(e.target.value)}
          />
        ) : (
          <span className="dia-nom" onClick={() => setEditantData(true)} style={{ cursor: "pointer" }}>
            {dia || "(sense data — fes clic)"}
          </span>
        )}
        <span className="dia-total">{fmt(totalDia)}</span>
      </div>

      {linies.map((l) => (
        <div className="linia" key={l.id}>
          <span style={{ flex: 1.4, fontSize: 11, color: "var(--text-dim)" }}>{l.article}</span>
          <span style={{ flex: 0.7, fontSize: 11, color: "var(--text-dim)" }}>{l.quantitat ?? ""}</span>
          <span style={{ flex: 0.7, fontSize: 11 }}>{fmt(l.total)}</span>
          <button className="link-btn" onClick={() => eliminarLinia(l.id)}>×</button>
        </div>
      ))}

      <div className="linia" style={{ marginTop: 6 }}>
        <select value={nouArticle} onChange={(e) => setNouArticle(e.target.value)}>
          {ARTICLES_MERCHA.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="number" placeholder="Uds" value={novaQuantitat} onChange={(e) => setNovaQuantitat(e.target.value)} />
        <input type="number" placeholder="Total €" value={nouTotal} onChange={(e) => setNouTotal(e.target.value)} />
        <button className="link-btn" onClick={afegirLinia} style={{ fontSize: 16 }}>+</button>
      </div>
    </div>
  );
}

export default function MerchaCards({ edicio }: { edicio: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novaData, setNovaData] = useState("");

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from("mercha").select("*").eq("edicio", edicio).order("dia");
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const afegirDia = async () => {
    if (!novaData) return;
    await supabase.from("mercha").insert({
      edicio,
      dia: novaData,
      article: ARTICLES_MERCHA[0],
      quantitat: null,
      total: 0,
    });
    setNovaData("");
    carregar();
  };

  const grups = rows.reduce((acc: Record<string, any[]>, r) => {
    const key = r.dia || "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const totalsPerArticle: Record<string, number> = {};
  ARTICLES_MERCHA.forEach((a) => { totalsPerArticle[a] = 0; });
  rows.forEach((r) => { totalsPerArticle[r.article] = (totalsPerArticle[r.article] || 0) + Number(r.total || 0); });

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="grid" style={{ marginBottom: 16 }}>
        {Object.keys(grups).sort().map((dia) => (
          <DiaGroup key={dia} dia={dia} linies={grups[dia]} onRefresh={carregar} />
        ))}
      </div>

      <div className="linia" style={{ maxWidth: 300, marginBottom: 24 }}>
        <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} />
        <button className="btn" onClick={afegirDia}>+ Afegir dia</button>
      </div>

      <div className="eyebrow" style={{ marginTop: 8 }}>Referència per article (real 2026)</div>
      <table>
        <thead><tr><th>Article</th><th>2026 (referència)</th><th>2027 (fins ara)</th></tr></thead>
        <tbody>
          {ARTICLES_MERCHA.map((a) => (
            <tr key={a}>
              <td>{a}</td>
              <td className="dim">{fmt(REFERENCIA_2026[a] || 0)}</td>
              <td style={{ color: "var(--accent-amber)" }}>{fmt(totalsPerArticle[a] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
