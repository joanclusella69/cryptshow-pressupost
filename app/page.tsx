"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EDICIONS } from "@/lib/fields";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent-wine)",
        padding: 18,
      }}
    >
      <span style={{ display: "block", fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
        {value}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</span>
    </div>
  );
}

export default function ResumPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ ingressos: 0, despeses: 0, entrades: 0, mercha: 0, publicitat: 0 });

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [mov, ent, mer, pub] = await Promise.all([
        supabase.from("moviments").select("tipus, real").eq("edicio", edicio),
        supabase.from("entrades").select("caixa, web").eq("edicio", edicio),
        supabase.from("mercha").select("total").eq("edicio", edicio),
        supabase.from("publicitat").select("confirmat").eq("edicio", edicio),
      ]);
      const ingressos = (mov.data || []).filter((m) => m.tipus === "ingres").reduce((s, m) => s + Number(m.real || 0), 0);
      const despeses = (mov.data || []).filter((m) => m.tipus === "despesa").reduce((s, m) => s + Number(m.real || 0), 0);
      const entrades = (ent.data || []).reduce((s, e) => s + Number(e.caixa || 0) + Number(e.web || 0), 0);
      const mercha = (mer.data || []).reduce((s, m) => s + Number(m.total || 0), 0);
      const publicitat = (pub.data || []).reduce((s, p) => s + Number(p.confirmat || 0), 0);
      setStats({ ingressos, despeses, entrades, mercha, publicitat });
      setLoading(false);
    };
    carregar();
  }, [edicio]);

  const balanc = stats.ingressos + stats.entrades + stats.mercha + stats.publicitat - stats.despeses;
  const fmt = (n: number) => `${n.toLocaleString("ca-ES")} €`;

  return (
    <section style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16,
        }}
      >
        <div>
          <div className="eyebrow">Cop d'ull general</div>
          <h2>Resum del pressupost</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="empty">Carregant…</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            <Stat label="Ingressos generals" value={fmt(stats.ingressos)} />
            <Stat label="Despeses generals" value={fmt(stats.despeses)} />
            <Stat label="Entrades" value={fmt(stats.entrades)} />
            <Stat label="Mercha" value={fmt(stats.mercha)} />
            <Stat label="Publicitat confirmada" value={fmt(stats.publicitat)} />
            <Stat label="Balanç total" value={fmt(balanc)} />
          </div>
          <p className="empty">
            Balanç = ingressos + entrades + mercha + publicitat confirmada − despeses, per a l'edició seleccionada.
          </p>
        </>
      )}
    </section>
  );
}
