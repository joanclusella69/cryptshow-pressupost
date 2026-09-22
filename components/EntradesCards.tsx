"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function eurosSessio(s: any) {
  return Number(s.unitats_taquilla || 0) * Number(s.preu_taquilla || 0) + Number(s.unitats_web || 0) * Number(s.preu_web || 0);
}
function entradesPropiesSessio(s: any) {
  return Number(s.unitats_taquilla || 0) + Number(s.unitats_web || 0);
}

function CampPreu({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <span className="input-eur">
      <input type="number" placeholder="0" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <span className="eur-suffix">€</span>
    </span>
  );
}

function RefInput({ valor, onDesar }: { valor: number | null; onDesar: (v: number) => void }) {
  const [v, setV] = useState(valor ?? "");
  useEffect(() => setV(valor ?? ""), [valor]);
  return (
    <input
      type="number"
      className="ref-input"
      placeholder="XX"
      value={v}
      onChange={(e) => setV(e.target.value as any)}
      onBlur={() => onDesar(Number(v) || 0)}
    />
  );
}

function SessioRow({ s, onChange, onDelete, refValor, onRefSave }: any) {
  return (
    <div className="sessio-bloc">
      <div className="linia">
        <input style={{ flex: 1.6 }} placeholder="Nom sessió" value={s.nom || ""} onChange={(e) => onChange(s.id, "nom", e.target.value)} />
        <label className="boost-check" title="Els abonaments sumen assistents aquí">
          <input type="checkbox" checked={!!s.boost_abonament} onChange={(e) => onChange(s.id, "boost_abonament", e.target.checked)} />
          abon.
        </label>
        <button className="link-btn" onClick={() => onDelete(s.id)}>×</button>
      </div>
      <div className="linia">
        <span className="mini-lbl">Taquilla</span>
        <input type="number" placeholder="uds" value={s.unitats_taquilla ?? ""} onChange={(e) => onChange(s.id, "unitats_taquilla", e.target.value === "" ? "" : Number(e.target.value))} />
        <CampPreu value={s.preu_taquilla} onChange={(v) => onChange(s.id, "preu_taquilla", v === "" ? "" : Number(v))} />
        <span className="mini-lbl">Web</span>
        <input type="number" placeholder="uds" value={s.unitats_web ?? ""} onChange={(e) => onChange(s.id, "unitats_web", e.target.value === "" ? "" : Number(e.target.value))} />
        <CampPreu value={s.preu_web} onChange={(v) => onChange(s.id, "preu_web", v === "" ? "" : Number(v))} />
      </div>
      <div className="resum-sessio">
        <span>{fmt(eurosSessio(s))} · {entradesPropiesSessio(s)} ent.</span>
        <span>2026: <RefInput valor={refValor} onDesar={onRefSave} /></span>
      </div>
    </div>
  );
}

function DiaCard({ dia, entradesAbonFestival, onRenameDia, onRenameDiaBlur, onDeleteDia, onMoure, esPrimer, esUltim, onSessioChange, onSessioAdd, onSessioDelete, onAbonamentChange, referencies, onRefSave }: any) {
  const abonUnitats = dia.te_abonaments ? Number(dia.abonament_unitats || 0) : 0;
  const abonEuros = dia.te_abonaments ? abonUnitats * Number(dia.abonament_preu || 0) : 0;
  const eurosSessions = dia.sessions.reduce((s: number, x: any) => s + eurosSessio(x), 0);
  const totalDia = eurosSessions + abonEuros;
  const totalEntradesDia = dia.sessions.reduce(
    (s: number, x: any) => s + entradesPropiesSessio(x) + (x.boost_abonament ? abonUnitats + entradesAbonFestival : 0),
    0
  );

  return (
    <div className="card">
      <div className="card-top">
        <div className="fletxes">
          <button className="link-btn" disabled={esPrimer} onClick={() => onMoure(-1)}>▲</button>
          <button className="link-btn" disabled={esUltim} onClick={() => onMoure(1)}>▼</button>
        </div>
        <input className="dia-nom" value={dia.nom} onChange={(e) => onRenameDia(dia.id, e.target.value)} onBlur={(e) => onRenameDiaBlur(dia.id, e.target.value)} />
        <button className="link-btn" onClick={() => onDeleteDia(dia.id)}>×</button>
      </div>
      <div className="dia-total-linia">{fmt(totalDia)} · {totalEntradesDia} ent.</div>

      {dia.sessions.length === 0 && <p className="nota" style={{ marginBottom: 8 }}>Cap sessió encara.</p>}

      {dia.sessions.map((s: any) => (
        <SessioRow
          key={s.id}
          s={s}
          onChange={(id: string, camp: string, valor: any) => onSessioChange(dia.id, id, camp, valor)}
          onDelete={(id: string) => onSessioDelete(dia.id, id)}
          refValor={referencies[`dia:${dia.nom}|sessio:${s.nom}`] ?? null}
          onRefSave={(v: number) => onRefSave(`dia:${dia.nom}|sessio:${s.nom}`, v)}
        />
      ))}
      <button className="add-linia" onClick={() => onSessioAdd(dia.id)}>+ afegir sessió</button>

      {dia.te_abonaments && (
        <div className="abonaments-box">
          <div className="eyebrow-mini">Abonaments d'aquest dia</div>
          <div className="linia">
            <span className="mini-lbl">Uds</span>
            <input type="number" placeholder="0" value={dia.abonament_unitats ?? ""} onChange={(e) => onAbonamentChange(dia.id, "abonament_unitats", e.target.value === "" ? "" : Number(e.target.value))} />
            <span className="mini-lbl">Preu</span>
            <CampPreu value={dia.abonament_preu} onChange={(v) => onAbonamentChange(dia.id, "abonament_preu", v === "" ? "" : Number(v))} />
          </div>
          <p className="nota">Suma {abonUnitats || 0} assistent(s) a cada sessió marcada "abon." (menys Infantil, si no la marques), sense sumar-hi € (ja compta aquí, un sol cop).</p>
        </div>
      )}

      <div className="dia-ref-linia">
        Referència 2026 d'aquest dia: <RefInput valor={referencies[`dia:${dia.nom}`] ?? null} onDesar={(v) => onRefSave(`dia:${dia.nom}`, v)} />
      </div>
    </div>
  );
}

export default function EntradesCards({ edicio }: { edicio: string }) {
  const [dies, setDies] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ festival_unitats: "", festival_preu: 25 });
  const [referencies, setReferencies] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [d, s, c, r] = await Promise.all([
        supabase.from("entrades_dies").select("*").eq("edicio", edicio).order("ordre"),
        supabase.from("entrades_sessions").select("*").order("ordre"),
        supabase.from("entrades_config").select("*").eq("edicio", edicio).maybeSingle(),
        supabase.from("referencies_2026").select("*").eq("edicio", edicio),
      ]);

      let diesData = d.data || [];
      if (diesData.length === 0) {
        const base = [
          { edicio, nom: "Previ", ordre: 0, te_abonaments: false },
          { edicio, nom: "Concert", ordre: 1, te_abonaments: true },
          { edicio, nom: "Dia 1", ordre: 2, te_abonaments: true },
          { edicio, nom: "Dia 2", ordre: 3, te_abonaments: true },
        ];
        const { data: creats } = await supabase.from("entrades_dies").insert(base).select();
        diesData = creats || [];
      }

      let configData = c.data;
      if (!configData) {
        const { data: creat } = await supabase.from("entrades_config").insert({ edicio, festival_unitats: 0, festival_preu: 25 }).select().single();
        configData = creat;
      }

      const refs: Record<string, number> = {};
      (r.data || []).forEach((row: any) => { refs[row.clau] = Number(row.valor || 0); });

      const totesSessions = s.data || [];
      setDies(diesData.map((dd: any) => ({ ...dd, sessions: totesSessions.filter((ss: any) => ss.dia_id === dd.id) })));
      setConfig(configData);
      setReferencies(refs);
      setLoading(false);
    };
    carregar();
  }, [edicio]);

  // ── Sessions: canvi instantani en local, desat en segon pla ──
  const onSessioChange = (diaId: string, sessionId: string, camp: string, valor: any) => {
    setDies((prev) =>
      prev.map((d) =>
        d.id !== diaId ? d : { ...d, sessions: d.sessions.map((s: any) => (s.id === sessionId ? { ...s, [camp]: valor } : s)) }
      )
    );
    supabase.from("entrades_sessions").update({ [camp]: valor === "" ? null : valor }).eq("id", sessionId);
  };

  const onSessioAdd = async (diaId: string) => {
    const dia = dies.find((d) => d.id === diaId);
    const { data } = await supabase.from("entrades_sessions").insert({ dia_id: diaId, nom: "", ordre: dia?.sessions.length || 0 }).select().single();
    if (data) setDies((prev) => prev.map((d) => (d.id !== diaId ? d : { ...d, sessions: [...d.sessions, data] })));
  };

  const onSessioDelete = (diaId: string, sessionId: string) => {
    setDies((prev) => prev.map((d) => (d.id !== diaId ? d : { ...d, sessions: d.sessions.filter((s: any) => s.id !== sessionId) })));
    supabase.from("entrades_sessions").delete().eq("id", sessionId);
  };

  const onAbonamentChange = (diaId: string, camp: string, valor: any) => {
    setDies((prev) => prev.map((d) => (d.id !== diaId ? d : { ...d, [camp]: valor })));
    supabase.from("entrades_dies").update({ [camp]: valor === "" ? null : valor }).eq("id", diaId);
  };

  const onRenameDia = (diaId: string, nom: string) => {
    setDies((prev) => prev.map((d) => (d.id !== diaId ? d : { ...d, nom })));
  };
  const onRenameDiaBlur = (diaId: string, nom: string) => {
    supabase.from("entrades_dies").update({ nom }).eq("id", diaId);
  };

  const onDeleteDia = (diaId: string) => {
    setDies((prev) => prev.filter((d) => d.id !== diaId));
    supabase.from("entrades_dies").delete().eq("id", diaId);
  };

  const afegirDia = async () => {
    const { data } = await supabase.from("entrades_dies").insert({ edicio, nom: `Dia ${dies.length}`, ordre: dies.length, te_abonaments: true }).select().single();
    if (data) setDies([...dies, { ...data, sessions: [] }]);
  };

  const moureDia = (idx: number, dir: number) => {
    setDies((prev) => {
      const noves = [...prev];
      const [item] = noves.splice(idx, 1);
      noves.splice(idx + dir, 0, item);
      Promise.all(noves.map((d, i) => supabase.from("entrades_dies").update({ ordre: i }).eq("id", d.id)));
      return noves;
    });
  };

  const desarReferencia = (clau: string, valor: number) => {
    setReferencies((prev) => ({ ...prev, [clau]: valor }));
    supabase.from("referencies_2026").upsert({ edicio, clau, valor }, { onConflict: "edicio,clau" });
  };

  const desarConfig = (camp: string, valor: any) => {
    setConfig((prev: any) => ({ ...prev, [camp]: valor }));
    supabase.from("entrades_config").update({ [camp]: valor === "" ? null : valor }).eq("edicio", edicio);
  };

  const entradesAbonFestival = Number(config.festival_unitats || 0);
  const eurosAbonFestival = Number(config.festival_unitats || 0) * Number(config.festival_preu || 0);

  const totalGeneral = dies.reduce((s, d) => {
    const eurosSessions = d.sessions.reduce((s2: number, x: any) => s2 + eurosSessio(x), 0);
    const eurosAbonDia = d.te_abonaments ? Number(d.abonament_unitats || 0) * Number(d.abonament_preu || 0) : 0;
    return s + eurosSessions + eurosAbonDia;
  }, 0) + eurosAbonFestival;

  const entradesGeneral = dies.reduce((s, d) => {
    const abonUnitatsDia = d.te_abonaments ? Number(d.abonament_unitats || 0) : 0;
    return s + d.sessions.reduce(
      (s2: number, x: any) => s2 + entradesPropiesSessio(x) + (x.boost_abonament ? abonUnitatsDia + entradesAbonFestival : 0),
      0
    );
  }, 0);

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="link-line">
        <div><span className="dim">Total entrades:</span> <b>{fmt(totalGeneral)}</b></div>
        <div><span className="dim">Nombre d'entrades:</span> <b>{entradesGeneral}</b></div>
      </div>

      <div className="grid">
        {dies.map((d, idx) => (
          <DiaCard
            key={d.id}
            dia={d}
            entradesAbonFestival={entradesAbonFestival}
            onRenameDia={onRenameDia}
            onRenameDiaBlur={onRenameDiaBlur}
            onDeleteDia={onDeleteDia}
            onMoure={(dir: number) => moureDia(idx, dir)}
            esPrimer={idx === 0}
            esUltim={idx === dies.length - 1}
            onSessioChange={onSessioChange}
            onSessioAdd={onSessioAdd}
            onSessioDelete={onSessioDelete}
            onAbonamentChange={onAbonamentChange}
            referencies={referencies}
            onRefSave={desarReferencia}
          />
        ))}
      </div>

      <button className="btn" onClick={afegirDia} style={{ marginBottom: 24 }}>+ Afegir dia</button>

      <div className="card" style={{ maxWidth: 300, borderLeftColor: "var(--accent-amber)" }}>
        <div className="eyebrow-mini">Abonament Tot Festival</div>
        <div className="linia">
          <span className="mini-lbl">Uds</span>
          <input type="number" placeholder="0" value={config.festival_unitats ?? ""} onChange={(e) => desarConfig("festival_unitats", e.target.value === "" ? "" : Number(e.target.value))} />
          <span className="mini-lbl">Preu</span>
          <CampPreu value={config.festival_preu} onChange={(v) => desarConfig("festival_preu", v === "" ? "" : Number(v))} />
        </div>
        <p className="nota">{entradesAbonFestival} assistent(s) sumen a cada sessió marcada "abon." de tots els dies. El valor ({fmt(eurosAbonFestival)}) no s'atribueix a cap dia — engreix directament el total de l'edició.</p>
        <div className="dia-ref-linia">
          Referència 2026: <RefInput valor={referencies["abonament_festival"] ?? null} onDesar={(v) => desarReferencia("abonament_festival", v)} />
        </div>
      </div>

      <div className="eyebrow" style={{ marginTop: 28 }}>Total general (edició)</div>
      <div className="dia-ref-linia" style={{ marginBottom: 8 }}>
        Referència 2026: <RefInput valor={referencies["total_general"] ?? null} onDesar={(v) => desarReferencia("total_general", v)} />
        {" · "}2027 (fins ara): <b style={{ color: "var(--accent-amber)" }}>{fmt(totalGeneral)}</b>
      </div>
    </div>
  );
}
