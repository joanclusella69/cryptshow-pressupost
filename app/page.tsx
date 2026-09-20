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
  const [stats, setStats] = useState({ ingressos: 0, despeses: 0, aportacioCryptshow: 0, publicitat: 0 });
  const [previst, setPrevist] = useState({ ingressos: 0, despeses: 0, aportacioCryptshow: 0, publicitat: 0 });

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [mov, pub, dies, altres, mer, prev] = await Promise.all([
        supabase.from("moviments").select("tipus, real").eq("edicio", edicio),
        supabase.from("publicitat").select("confirmat").eq("edicio", edicio),
        supabase.from("cryptshow_dies").select("entrades").eq("edicio", edicio),
        supabase.from("cryptshow_altres").select("import").eq("edicio", edicio),
        supabase.from("mercha").select("total").eq("edicio", edicio),
        supabase.from("previstos").select("tipus, categoria, previst").eq("edicio", edicio),
      ]);
      const ingressos = (mov.data || []).filter((m) => m.tipus === "ingres").reduce((s, m) => s + Number(m.real || 0), 0);
      const despeses = (mov.data || []).filter((m) => m.tipus === "despesa").reduce((s, m) => s + Number(m.real || 0), 0);
      const publicitat = (pub.data || []).reduce((s, p) => s + Number(p.confirmat || 0), 0);
      const totalEntrades = (dies.data || []).reduce((s, d) => s + Number(d.entrades || 0), 0);
      const totalMercha = (mer.data || []).reduce((s, m) => s + Number(m.total || 0), 0);
      const totalAltres = (altres.data || []).reduce((s, a) => s + Number(a.import || 0), 0);
      setStats({ ingressos, despeses, aportacioCryptshow: totalEntrades + totalMercha + totalAltres, publicitat });

      const previstos = prev.data || [];
      const ingressosPrevist = previstos.filter((p) => p.tipus === "ingres").reduce((s, p) => s + Number(p.previst || 0), 0);
      const despesesPrevist = previstos.filter((p) => p.tipus === "despesa").reduce((s, p) => s + Number(p.previst || 0), 0);
      const aportacioPrevist = previstos.find((p) => p.categoria === "Aportació Cryptshow")?.previst || 0;
      const publicitatPrevist = previstos.find((p) => p.categoria === "Publicitat i patrocinadors")?.previst || 0;
      setPrevist({ ingressos: ingressosPrevist, despeses: despesesPrevist, aportacioCryptshow: Number(aportacioPrevist), publicitat: Number(publicitatPrevist) });

      setLoading(false);
    };
    carregar();
  }, [edicio]);

  const balanc = stats.ingressos + stats.aportacioCryptshow + stats.publicitat - stats.despeses;
  const balancPrevist = previst.ingressos + previst.aportacioCryptshow + previst.publicitat - previst.despeses;
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
          <div className="eyebrow" style={{ marginBottom: 0 }}>Previst</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, margin: "8px 0 16px" }}>
            <Stat label="Ingressos previstos" value={fmt(previst.ingressos)} />
            <Stat label="Despeses previstes" value={fmt(previst.despeses)} />
            <Stat label="Aportació Cryptshow (previst)" value={fmt(previst.aportacioCryptshow)} />
            <Stat label="Publicitat (previst)" value={fmt(previst.publicitat)} />
          </div>
          <div style={{ marginBottom: 32 }}>
            <Stat label="Balanç total (previst)" value={fmt(balancPrevist)} />
          </div>

          <div className="eyebrow" style={{ marginBottom: 0 }}>Real</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, margin: "8px 0 16px" }}>
            <Stat label="Ingressos generals" value={fmt(stats.ingressos)} />
            <Stat label="Despeses generals" value={fmt(stats.despeses)} />
            <Stat label="Aportació Cryptshow" value={fmt(stats.aportacioCryptshow)} />
            <Stat label="Publicitat confirmada" value={fmt(stats.publicitat)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Stat label="Balanç total (real)" value={fmt(balanc)} />
          </div>
          <p className="empty">
            Balanç = ingressos + aportació Cryptshow + publicitat − despeses, per a l'edició seleccionada.
          </p>
        </>
      )}
    </section>
  );
}
