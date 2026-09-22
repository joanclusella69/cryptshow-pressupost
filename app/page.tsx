"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EDICIONS } from "@/lib/fields";
import { getTotalEntrades } from "@/lib/entradesTotal";

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

function Bloc({ titol, ingressos, despeses, fmt }: { titol: string; ingressos: number; despeses: number; fmt: (n: number) => string }) {
  const balanc = ingressos - despeses;
  return (
    <>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{titol}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
        <Stat label="Ingressos" value={fmt(ingressos)} />
        <Stat label="Despeses" value={fmt(despeses)} />
      </div>
      <div style={{ marginBottom: 32 }}>
        <Stat label={`Balanç ${titol.toLowerCase()}`} value={fmt(balanc)} />
      </div>
    </>
  );
}

export default function ResumPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);
  const [loading, setLoading] = useState(true);
  const [real, setReal] = useState({ ingressos: 0, despeses: 0 });
  const [previst, setPrevist] = useState({ ingressos: 0, despeses: 0 });

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [mov, pub, dies, altres, mer, prev, totalEntrades] = await Promise.all([
        supabase.from("moviments").select("tipus, real").eq("edicio", edicio),
        supabase.from("publicitat").select("confirmat, cobrat").eq("edicio", edicio),
        supabase.from("cryptshow_dies").select("entrades").eq("edicio", edicio),
        supabase.from("cryptshow_altres").select("import").eq("edicio", edicio),
        supabase.from("mercha").select("total").eq("edicio", edicio),
        supabase.from("previstos").select("tipus, previst").eq("edicio", edicio),
        getTotalEntrades(edicio),
      ]);

      const ingressosManual = (mov.data || []).filter((m) => m.tipus === "ingres").reduce((s, m) => s + Number(m.real || 0), 0);
      const despeses = (mov.data || []).filter((m) => m.tipus === "despesa").reduce((s, m) => s + Number(m.real || 0), 0);
      const publicitat = (pub.data || []).filter((p) => p.cobrat).reduce((s, p) => s + Number(p.confirmat || 0), 0);
      const totalMercha = (mer.data || []).reduce((s, m) => s + Number(m.total || 0), 0);
      const totalAltres = (altres.data || []).reduce((s, a) => s + Number(a.import || 0), 0);
      const aportacioCryptshow = totalEntrades + totalMercha + totalAltres;
      setReal({ ingressos: ingressosManual + publicitat + aportacioCryptshow, despeses });

      const previstos = prev.data || [];
      const ingressosPrevist = previstos.filter((p) => p.tipus === "ingres").reduce((s, p) => s + Number(p.previst || 0), 0);
      const despesesPrevist = previstos.filter((p) => p.tipus === "despesa").reduce((s, p) => s + Number(p.previst || 0), 0);
      setPrevist({ ingressos: ingressosPrevist, despeses: despesesPrevist });

      setLoading(false);
    };
    carregar();
  }, [edicio]);

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
          <Bloc titol="Previst" ingressos={previst.ingressos} despeses={previst.despeses} fmt={fmt} />
          <Bloc titol="Real" ingressos={real.ingressos} despeses={real.despeses} fmt={fmt} />
          <p className="empty">
            "Ingressos" ja suma totes les partides (Ajuntament, The Crypts, Aportació Cryptshow, Publicitat i Plataformes).
          </p>
        </>
      )}
    </section>
  );
}
