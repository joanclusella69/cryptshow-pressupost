"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function DiaCard({ dia, onChange, onDelete }: { dia: any; onChange: (camp: string, valor: any) => void; onDelete: () => void }) {
  const [nom, setNom] = useState(dia.nom);
  const [entrades, setEntrades] = useState(dia.entrades ?? "");
  const [mercha, setMercha] = useState(dia.mercha ?? "");

  const total = Number(entrades || 0) + Number(mercha || 0);

  return (
    <div className="card">
      <div className="card-top">
        <input className="dia-nom" value={nom} onChange={(e) => setNom(e.target.value)} onBlur={() => onChange("nom", nom)} />
        <span className="dia-total">{fmt(total)}</span>
        <button className="link-btn" onClick={onDelete} title="Eliminar dia">×</button>
      </div>
      <div className="row">
        <label>Entrades €
          <input type="number" value={entrades} onChange={(e) => setEntrades(e.target.value)} onBlur={() => onChange("entrades", Number(entrades) || 0)} />
        </label>
        <label>Mercha €
          <input type="number" value={mercha} onChange={(e) => setMercha(e.target.value)} onBlur={() => onChange("mercha", Number(mercha) || 0)} />
        </label>
      </div>
    </div>
  );
}

export default function CryptshowBloc({ edicio }: { edicio: string }) {
  const [dies, setDies] = useState<any[]>([]);
  const [altres, setAltres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [d, a] = await Promise.all([
      supabase.from("cryptshow_dies").select("*").eq("edicio", edicio).order("created_at"),
      supabase.from("cryptshow_altres").select("*").eq("edicio", edicio).order("created_at"),
    ]);
    let diesData = d.data || [];
    if (diesData.length === 0) {
      const base = ["Previ", "Dia 1", "Dia 2", "Dia 3"];
      const inserts = base.map((nom) => ({ edicio, nom, entrades: 0, mercha: 0 }));
      const { data: creats } = await supabase.from("cryptshow_dies").insert(inserts).select();
      diesData = creats || [];
    }
    setDies(diesData);
    setAltres(a.data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const actualitzarDia = async (id: string, camp: string, valor: any) => {
    setDies(dies.map((d) => (d.id === id ? { ...d, [camp]: valor } : d)));
    await supabase.from("cryptshow_dies").update({ [camp]: valor }).eq("id", id);
  };

  const afegirDia = async () => {
    const { data } = await supabase.from("cryptshow_dies").insert({ edicio, nom: `Dia ${dies.length}`, entrades: 0, mercha: 0 }).select().single();
    if (data) setDies([...dies, data]);
  };

  const eliminarDia = async (id: string) => {
    await supabase.from("cryptshow_dies").delete().eq("id", id);
    setDies(dies.filter((d) => d.id !== id));
  };

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

  const totalDies = dies.reduce((s, d) => s + Number(d.entrades || 0) + Number(d.mercha || 0), 0);
  const totalAltres = altres.reduce((s, a) => s + Number(a.import || 0), 0);
  const totalCryptshow = totalDies + totalAltres;

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="grid">
        {dies.map((d) => (
          <DiaCard key={d.id} dia={d} onChange={(camp, valor) => actualitzarDia(d.id, camp, valor)} onDelete={() => eliminarDia(d.id)} />
        ))}
      </div>
      <button className="btn" onClick={afegirDia} style={{ marginBottom: 16 }}>+ Afegir dia</button>

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
        <div className="dim">→ Dies (Entrades+Mercha) + Altres = <b style={{ color: "var(--accent-amber)" }}>Real</b> de "Aportació Cryptshow" a Ingressos</div>
      </div>
    </div>
  );
}
