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

function CampPreu({ value, onChange, onBlur }: { value: any; onChange: (e: any) => void; onBlur: () => void }) {
  return (
    <span className="input-eur">
      <input type="number" placeholder="0" value={value ?? ""} onChange={onChange} onBlur={onBlur} />
      <span className="eur-suffix">€</span>
    </span>
  );
}

function RefInput({ valor, onDesar }: { valor: number | null; onDesar: (v: number) => void }) {
  const [v, setV] = useState(valor ?? "");
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

function SessioRow({ s, onSave, onDelete, refValor, onRefSave }: any) {
  const [local, setLocal] = useState(s);
  const desar = async (camp: string, valor: any) => {
    const nou = { ...local, [camp]: valor };
    setLocal(nou);
    await onSave(s.id, { [camp]: valor });
  };

  return (
    <div className="sessio-bloc">
      <div className="linia">
        <input style={{ flex: 1.6 }} placeholder="Nom sessió" value={local.nom || ""} onChange={(e) => setLocal({ ...local, nom: e.target.value })} onBlur={(e) => desar("nom", e.target.value)} />
        <label className="boost-check" title="Els abonaments sumen assistents aquí">
          <input type="checkbox" checked={!!local.boost_abonament} onChange={(e) => { setLocal({ ...local, boost_abonament: e.target.checked }); desar("boost_abonament", e.target.checked); }} />
          abon.
        </label>
        <button className="link-btn" onClick={() => onDelete(s.id)}>×</button>
      </div>
      <div className="linia">
        <span className="mini-lbl">Taquilla</span>
        <input type="number" placeholder="uds" value={local.unitats_taquilla ?? ""} onChange={(e) => setLocal({ ...local, unitats_taquilla: e.target.value })} onBlur={(e) => desar("unitats_taquilla", Number(e.target.value) || 0)} />
        <CampPreu value={local.preu_taquilla} onChange={(e) => setLocal({ ...local, preu_taquilla: e.target.value })} onBlur={() => desar("preu_taquilla", Number(local.preu_taquilla) || 0)} />
        <span className="mini-lbl">Web</span>
        <input type="number" placeholder="uds" value={local.unitats_web ?? ""} onChange={(e) => setLocal({ ...local, unitats_web: e.target.value })} onBlur={(e) => desar("unitats_web", Number(e.target.value) || 0)} />
        <CampPreu value={local.preu_web} onChange={(e) => setLocal({ ...local, preu_web: e.target.value })} onBlur={() => desar("preu_web", Number(local.preu_web) || 0)} />
      </div>
      <div className="resum-sessio">
        <span>2026: <RefInput valor={refValor} onDesar={onRefSave} /></span>
      </div>
    </div>
  );
}

function DiaCard({ dia, entradesAbonFestival, onRenamed, onDelete, onMoure, esPrimer, esUltim, onRefresh }: any) {
  const [nom, setNom] = useState(dia.nom);

  const renombrar = async () => {
    if (nom !== dia.nom) {
      await supabase.from("entrades_dies").update({ nom }).eq("id", dia.id);
      onRenamed();
    }
  };

  const afegirSessio = async () => {
    await supabase.from("entrades_sessions").insert({ dia_id: dia.id, nom: "", ordre: dia.sessions.length });
    onRefresh();
  };
  const eliminarSessio = async (id: string) => {
    await supabase.from("entrades_sessions").delete().eq("id", id);
    onRefresh();
  };
  const desarSessio = async (id: string, camps: any) => {
    await supabase.from("entrades_sessions").update(camps).eq("id", id);
    onRefresh();
  };

  const [abonUnitats, setAbonUnitats] = useState(dia.abonament_unitats ?? "");
  const [abonPreu, setAbonPreu] = useState(dia.abonament_preu ?? 8);
  const desarAbonament = async (camp: string, valor: any) => {
    await supabase.from("entrades_dies").update({ [camp]: valor }).eq("id", dia.id);
    onRefresh();
  };

  const abonEuros = dia.te_abonaments ? Number(abonUnitats || 0) * Number(abonPreu || 0) : 0;
  const eurosSessions = dia.sessions.reduce((s: number, x: any) => s + eurosSessio(x), 0);
  const totalDia = eurosSessions + abonEuros;
  const totalEntradesDia = dia.sessions.reduce(
    (s: number, x: any) => s + entradesPropiesSessio(x) + (x.boost_abonament ? Number(abonUnitats || 0) + entradesAbonFestival : 0),
    0
  );

  return (
    <div className="card">
      <div className="card-top">
        <div className="fletxes">
          <button className="link-btn" disabled={esPrimer} onClick={() => onMoure(-1)}>▲</button>
          <button className="link-btn" disabled={esUltim} onClick={() => onMoure(1)}>▼</button>
        </div>
        <input className="dia-nom" value={nom} onChange={(e) => setNom(e.target.value)} onBlur={renombrar} />
        <button className="link-btn" onClick={() => onDelete(dia.id)}>×</button>
      </div>
      <div className="dia-total-linia">{fmt(totalDia)} · {totalEntradesDia} ent.</div>

      {dia.sessions.length === 0 && <p className="nota" style={{ marginBottom: 8 }}>Cap sessió encara.</p>}

      {dia.sessions.map((s: any) => (
        <SessioRow
          key={s.id}
          s={s}
          onSave={desarSessio}
          onDelete={eliminarSessio}
          refValor={dia.referencies[`dia:${dia.nom}|sessio:${s.nom}`] ?? null}
          onRefSave={(v: number) => dia.onRefSave(`dia:${dia.nom}|sessio:${s.nom}`, v)}
        />
      ))}
      <button className="add-linia" onClick={afegirSessio}>+ afegir sessió</button>

      {dia.te_abonaments && (
        <div className="abonaments-box">
          <div className="eyebrow-mini">Abonaments d'aquest dia</div>
          <div className="linia">
            <span className="mini-lbl">Uds</span>
            <input type="number" placeholder="0" value={abonUnitats} onChange={(e) => setAbonUnitats(e.target.value as any)} onBlur={() => desarAbonament("abonament_unitats", Number(abonUnitats) || 0)} />
            <span className="mini-lbl">Preu</span>
            <CampPreu value={abonPreu} onChange={(e) => setAbonPreu(e.target.value as any)} onBlur={() => desarAbonament("abonament_preu", Number(abonPreu) || 0)} />
          </div>
          <p className="nota">Suma {abonUnitats || 0} assistent(s) a cada sessió marcada "abon." (menys Infantil, si no la marques), sense sumar-hi € (ja compta aquí, un sol cop).</p>
        </div>
      )}

      <div className="dia-ref-linia">
        Referència 2026 d'aquest dia: <RefInput valor={dia.referencies[`dia:${dia.nom}`] ?? null} onDesar={(v) => dia.onRefSave(`dia:${dia.nom}`, v)} />
      </div>
    </div>
  );
}

export default function EntradesCards({ edicio }: { edicio: string }) {
  const [dies, setDies] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ festival_unitats: "", festival_preu: 25 });
  const [referencies, setReferencies] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const desarReferencia = async (clau: string, valor: number) => {
    await supabase.from("referencies_2026").upsert({ edicio, clau, valor }, { onConflict: "edicio,clau" });
    setReferencies({ ...referencies, [clau]: valor });
  };

  const afegirDia = async () => {
    const { data } = await supabase.from("entrades_dies").insert({ edicio, nom: `Dia ${dies.length}`, ordre: dies.length, te_abonaments: true }).select().single();
    if (data) setDies([...dies, { ...data, sessions: [] }]);
  };
  const eliminarDia = async (id: string) => {
    await supabase.from("entrades_dies").delete().eq("id", id);
    setDies(dies.filter((d) => d.id !== id));
  };
  const moureDia = async (idx: number, dir: number) => {
    const noves = [...dies];
    const [item] = noves.splice(idx, 1);
    noves.splice(idx + dir, 0, item);
    setDies(noves);
    await Promise.all(noves.map((d, i) => supabase.from("entrades_dies").update({ ordre: i }).eq("id", d.id)));
  };

  const desarConfig = async (camp: string, valor: any) => {
    const nou = { ...config, [camp]: valor };
    setConfig(nou);
    await supabase.from("entrades_config").update({ [camp]: valor }).eq("edicio", edicio);
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

  const diesAmbRef = dies.map((d) => ({ ...d, referencies, onRefSave: desarReferencia }));

  return (
    <div>
      <div className="link-line">
        <div><span className="dim">Total entrades:</span> <b>{fmt(totalGeneral)}</b></div>
        <div><span className="dim">Nombre d'entrades:</span> <b>{entradesGeneral}</b></div>
      </div>

      <div className="grid">
        {diesAmbRef.map((d, idx) => (
          <DiaCard
            key={d.id}
            dia={d}
            entradesAbonFestival={entradesAbonFestival}
            onRenamed={carregar}
            onDelete={eliminarDia}
            onMoure={(dir: number) => moureDia(idx, dir)}
            esPrimer={idx === 0}
            esUltim={idx === dies.length - 1}
            onRefresh={carregar}
          />
        ))}
      </div>

      <button className="btn" onClick={afegirDia} style={{ marginBottom: 24 }}>+ Afegir dia</button>

      <div className="card" style={{ maxWidth: 300, borderLeftColor: "var(--accent-amber)" }}>
        <div className="eyebrow-mini">Abonament Tot Festival</div>
        <div className="linia">
          <span className="mini-lbl">Uds</span>
          <input type="number" placeholder="0" value={config.festival_unitats ?? ""} onChange={(e) => setConfig({ ...config, festival_unitats: e.target.value })} onBlur={(e: any) => desarConfig("festival_unitats", Number(e.target.value) || 0)} />
          <span className="mini-lbl">Preu</span>
          <CampPreu value={config.festival_preu} onChange={(e) => setConfig({ ...config, festival_preu: e.target.value })} onBlur={() => desarConfig("festival_preu", Number(config.festival_preu) || 0)} />
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
