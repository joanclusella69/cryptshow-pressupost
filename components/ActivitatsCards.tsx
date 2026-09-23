"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const FITXES_FIXES = ["LMPV", "Festival Convidat", "Jornada Literària", "Pel·lícula Musicada", "Sessió Asiàtica"];
const CONCEPTES_FIXOS: Record<string, string[]> = {
  "LMPV": ["Drets de projecció", "Dietes convidat", "Transport convidat", "Allotjament convidat"],
  "Festival Convidat": ["Drets de projecció", "Dietes convidat", "Transport convidat", "Allotjament convidat"],
  "Jornada Literària": ["Dietes convidat", "Subministraments"],
  "Pel·lícula Musicada": ["Factura", "Dietes"],
  "Sessió Asiàtica": ["Drets de projecció"],
};
const FITXES_AMB_ALTRES = ["Pel·lícula Musicada", "Sessió Asiàtica"];

function CampPreu({ value, onChange }: { value: any; onChange: (v: string) => void }) {
  return (
    <span className="input-eur">
      <input type="number" placeholder="0" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <span className="eur-suffix">€</span>
    </span>
  );
}

function FitxaConceptes({ titol, conceptes, onChange, onDelete, permetAltres, onAdd }: any) {
  const totalPrevist = conceptes.reduce((s: number, c: any) => s + Number(c.previst || 0), 0);
  const totalReal = conceptes.reduce((s: number, c: any) => s + Number(c.real || 0), 0);

  return (
    <div className="card">
      <div className="card-top"><h3 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 14 }}>{titol}</h3></div>
      <div className="dia-total-linia">Previst {fmt(totalPrevist)} · Real {fmt(totalReal)}</div>
      <div className="capcalera-linia">
        <span style={{ flex: 1.2 }}>Concepte</span>
        <span style={{ flex: 0.8 }}>Previst</span>
        <span style={{ flex: 0.8 }}>Real</span>
      </div>
      {conceptes.map((c: any) => (
        <div className="linia" key={c.id}>
          {c.editable ? (
            <input style={{ flex: 1.2 }} placeholder="Nom" value={c.nom} onChange={(e) => onChange(c.id, "nom", e.target.value)} />
          ) : (
            <span className="mini-lbl" style={{ flex: 1.2 }}>{c.nom}</span>
          )}
          <CampPreu value={c.previst} onChange={(v) => onChange(c.id, "previst", v === "" ? "" : Number(v))} />
          <CampPreu value={c.real} onChange={(v) => onChange(c.id, "real", v === "" ? "" : Number(v))} />
          {c.editable && <button className="link-btn" onClick={() => onDelete(c.id)}>×</button>}
        </div>
      ))}
      {permetAltres && <button className="add-linia" onClick={onAdd}>+ afegir altre concepte</button>}
    </div>
  );
}

function FitxaJurat({ previst, onPrevistChange, convidats, onChange, onAdd, onDelete }: any) {
  const total = (camp: string) => convidats.reduce((s: number, c: any) => s + Number(c[camp] || 0), 0);
  const totalReal = total("transport_real") + total("allotjament_real") + total("dietes_real");

  return (
    <div className="card" style={{ gridColumn: "span 2" }}>
      <div className="card-top"><h3 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 14 }}>Jurat</h3></div>
      <div className="linia" style={{ marginBottom: 8 }}>
        <span className="mini-lbl">Previst (total)</span>
        <CampPreu value={previst} onChange={(v) => onPrevistChange(v === "" ? "" : Number(v))} />
      </div>
      <div className="capcalera-linia">
        <span style={{ flex: 1 }}>Convidat</span>
        <span style={{ flex: 0.8 }}>Transport</span>
        <span style={{ flex: 0.8 }}>Allotjament</span>
        <span style={{ flex: 0.8 }}>Dietes</span>
      </div>
      {convidats.map((c: any) => (
        <div className="linia" key={c.id}>
          <input style={{ flex: 1 }} value={c.nom} onChange={(e) => onChange(c.id, "nom", e.target.value)} />
          <CampPreu value={c.transport_real} onChange={(v) => onChange(c.id, "transport_real", v === "" ? "" : Number(v))} />
          <CampPreu value={c.allotjament_real} onChange={(v) => onChange(c.id, "allotjament_real", v === "" ? "" : Number(v))} />
          <CampPreu value={c.dietes_real} onChange={(v) => onChange(c.id, "dietes_real", v === "" ? "" : Number(v))} />
          <button className="link-btn" onClick={() => onDelete(c.id)}>×</button>
        </div>
      ))}
      <button className="add-linia" onClick={onAdd}>+ afegir convidat</button>
      <div className="dia-total-linia" style={{ marginTop: 8 }}>
        Transport: {fmt(total("transport_real"))} · Allotjament: {fmt(total("allotjament_real"))} · Dietes: {fmt(total("dietes_real"))}
      </div>
      <div className="dia-total-linia" style={{ color: "var(--accent-amber)", fontSize: 13 }}>
        Total real: {fmt(totalReal)}
      </div>
    </div>
  );
}

export default function ActivitatsCards({ edicio }: { edicio: string }) {
  const [conceptes, setConceptes] = useState<any[]>([]);
  const [jurat, setJurat] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ jurat_previst: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [c, j, cfg] = await Promise.all([
        supabase.from("activitats_conceptes").select("*").eq("edicio", edicio).order("ordre"),
        supabase.from("activitats_jurat_convidats").select("*").eq("edicio", edicio).order("ordre"),
        supabase.from("activitats_config").select("*").eq("edicio", edicio).maybeSingle(),
      ]);

      let conceptesData = c.data || [];
      if (conceptesData.length === 0) {
        const inserts: any[] = [];
        FITXES_FIXES.forEach((fitxa) => {
          CONCEPTES_FIXOS[fitxa].forEach((nom, i) => {
            inserts.push({ edicio, fitxa, nom, previst: 0, real: 0, editable: false, ordre: i });
          });
        });
        const { data: creats } = await supabase.from("activitats_conceptes").insert(inserts).select();
        conceptesData = creats || [];
      }

      let juratData = j.data || [];
      if (juratData.length === 0) {
        const inserts = [1, 2, 3, 4, 5].map((n) => ({ edicio, nom: `Convidat ${n}`, transport_real: 0, allotjament_real: 0, dietes_real: 0, ordre: n }));
        const { data: creats } = await supabase.from("activitats_jurat_convidats").insert(inserts).select();
        juratData = creats || [];
      }

      let configData = cfg.data;
      if (!configData) {
        const { data: creat } = await supabase.from("activitats_config").insert({ edicio, jurat_previst: 0 }).select().single();
        configData = creat;
      }

      setConceptes(conceptesData);
      setJurat(juratData);
      setConfig(configData);
      setLoading(false);
    };
    carregar();
  }, [edicio]);

  const onConcepteChange = (id: string, camp: string, valor: any) => {
    setConceptes((prev) => prev.map((c) => (c.id === id ? { ...c, [camp]: valor } : c)));
    supabase.from("activitats_conceptes").update({ [camp]: valor === "" ? null : valor }).eq("id", id).then(() => {});
  };
  const onConcepteDelete = (id: string) => {
    setConceptes((prev) => prev.filter((c) => c.id !== id));
    supabase.from("activitats_conceptes").delete().eq("id", id).then(() => {});
  };
  const onConcepteAdd = async (fitxa: string) => {
    const ordreActual = conceptes.filter((c) => c.fitxa === fitxa).length;
    const { data } = await supabase.from("activitats_conceptes").insert({ edicio, fitxa, nom: "Altres", previst: 0, real: 0, editable: true, ordre: ordreActual }).select().single();
    if (data) setConceptes((prev) => [...prev, data]);
  };

  const onJuratChange = (id: string, camp: string, valor: any) => {
    setJurat((prev) => prev.map((c) => (c.id === id ? { ...c, [camp]: valor } : c)));
    supabase.from("activitats_jurat_convidats").update({ [camp]: valor === "" ? null : valor }).eq("id", id).then(() => {});
  };
  const onJuratDelete = (id: string) => {
    setJurat((prev) => prev.filter((c) => c.id !== id));
    supabase.from("activitats_jurat_convidats").delete().eq("id", id).then(() => {});
  };
  const onJuratAdd = async () => {
    const { data } = await supabase.from("activitats_jurat_convidats").insert({ edicio, nom: `Convidat ${jurat.length + 1}`, transport_real: 0, allotjament_real: 0, dietes_real: 0, ordre: jurat.length }).select().single();
    if (data) setJurat((prev) => [...prev, data]);
  };

  const onPrevistJuratChange = (valor: any) => {
    setConfig((prev: any) => ({ ...prev, jurat_previst: valor }));
    supabase.from("activitats_config").update({ jurat_previst: valor === "" ? null : valor }).eq("edicio", edicio).then(() => {});
  };

  if (loading) return <p className="empty">Carregant…</p>;

  const totalJuratReal = jurat.reduce((s, c) => s + Number(c.transport_real || 0) + Number(c.allotjament_real || 0) + Number(c.dietes_real || 0), 0);
  const totalJuratPrevist = Number(config.jurat_previst || 0);

  const perFitxa = [
    ...FITXES_FIXES.map((fitxa) => {
      const items = conceptes.filter((c) => c.fitxa === fitxa);
      return { nom: fitxa, previst: items.reduce((s, c) => s + Number(c.previst || 0), 0), real: items.reduce((s, c) => s + Number(c.real || 0), 0) };
    }),
    { nom: "Jurat", previst: totalJuratPrevist, real: totalJuratReal },
  ];
  const totalPrevist = perFitxa.reduce((s, f) => s + f.previst, 0);
  const totalReal = perFitxa.reduce((s, f) => s + f.real, 0);

  return (
    <div>
      <div className="link-line">
        <div><span className="dim">Previst:</span> <b>{fmt(totalPrevist)}</b></div>
        <div><span className="dim">Real:</span> <b>{fmt(totalReal)}</b></div>
      </div>

      <div className="grid">
        {FITXES_FIXES.map((fitxa) => (
          <FitxaConceptes
            key={fitxa}
            titol={fitxa}
            conceptes={conceptes.filter((c) => c.fitxa === fitxa)}
            onChange={onConcepteChange}
            onDelete={onConcepteDelete}
            permetAltres={FITXES_AMB_ALTRES.includes(fitxa)}
            onAdd={() => onConcepteAdd(fitxa)}
          />
        ))}
        <FitxaJurat previst={config.jurat_previst} onPrevistChange={onPrevistJuratChange} convidats={jurat} onChange={onJuratChange} onAdd={onJuratAdd} onDelete={onJuratDelete} />
      </div>

      <div className="eyebrow" style={{ marginTop: 28 }}>Agregat per fitxa (crearà els conceptes a "Activitats i convidats" a Proveïdors)</div>
      <table>
        <thead><tr><th>Fitxa</th><th>Previst</th><th>Real</th></tr></thead>
        <tbody>
          {perFitxa.map((f) => (
            <tr key={f.nom}>
              <td>{f.nom}</td>
              <td>{fmt(f.previst)}</td>
              <td style={{ color: "var(--accent-amber)" }}>{fmt(f.real)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: "2px solid var(--border)" }}>
            <td>Total</td>
            <td>{fmt(totalPrevist)}</td>
            <td style={{ color: "var(--accent-amber)" }}>{fmt(totalReal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
