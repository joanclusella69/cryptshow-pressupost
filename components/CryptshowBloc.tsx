"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getTotalEntrades } from "@/lib/entradesTotal";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function CryptshowBloc({ edicio }: { edicio: string }) {
  const [totalEntrades, setTotalEntrades] = useState(0);
  const [totalMercha, setTotalMercha] = useState(0);
  const [altres, setAltres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [entrades, m, a] = await Promise.all([
      getTotalEntrades(edicio),
      supabase.from("mercha").select("total").eq("edicio", edicio),
      supabase.from("cryptshow_altres").select("*").eq("edicio", edicio).order("created_at"),
    ]);
    setTotalEntrades(entrades);
    setTotalMercha((m.data || []).reduce((s: number, r: any) => s + Number(r.total || 0), 0));
    setAltres(a.data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const actualitzarAltre = async (id: string, camp: string, valor: any) => {
    setAltres(altres.map((a) => (a.id === id ? { ...a, [camp]: valor } : a)));
    await supabase.from("cryptshow_altres").update({ [camp]: valor }).eq("id", id);
  };

  const afegirAltre = async () => {
    const { data } = await supabase.from("cryptshow_altres").insert({ edicio, nom: "Altres", import: 0 }).select().single();
    if (data) setAltres([...altres, data]);
  };

  const eliminarAltre = async (id: string) => {
    await supabase.from("cryptshow_altres").delete().eq("id", id);
    setAltres(altres.filter((a) => a.id !== id));
  };

  const totalAltres = altres.reduce((s, a) => s + Number(a.import || 0), 0);
  const totalCryptshow = totalEntrades + totalMercha + totalAltres;

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="stats">
        <div className="stat">
          <div className="lbl">Total Entrades</div>
          <div className="val">{fmt(totalEntrades)}</div>
          <div className="src">calculat des de la pestanya "Entrades"</div>
        </div>
        <div className="stat">
          <div className="lbl">Total Mercha</div>
          <div className="val">{fmt(totalMercha)}</div>
          <div className="src">calculat des de la pestanya "Mercha"</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Altres ingressos propis</h2>
          <div className="section-total">{fmt(totalAltres)}</div>
        </div>
        {altres.map((a) => (
          <div className="row-flat" key={a.id}>
            <input className="nom" value={a.nom || ""} onChange={(e) => actualitzarAltre(a.id, "nom", e.target.value)} placeholder="Nom (renombrable)" />
            <input className="num" type="number" value={a.import ?? ""} onChange={(e) => actualitzarAltre(a.id, "import", Number(e.target.value) || 0)} placeholder="Import €" />
            <button className="link-btn" onClick={() => eliminarAltre(a.id)}>×</button>
          </div>
        ))}
        <button className="add-row" onClick={afegirAltre}>+ Afegir línia</button>
      </div>

      <div className="link-line">
        <div><span className="dim">Total Cryptshow:</span> <b style={{ fontSize: 20 }}>{fmt(totalCryptshow)}</b></div>
        <div className="dim">→ Entrades (automàtic) + Mercha (automàtic) + Altres = <b style={{ color: "var(--accent-amber)" }}>Real</b> de "Aportació Cryptshow" a Ingressos</div>
      </div>
    </div>
  );
}
