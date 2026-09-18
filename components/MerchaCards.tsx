"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const PRODUCTES_BASE = [
  { nom: "Samarretes", pvp: 15 },
  { nom: "Bosses", pvp: 8 },
  { nom: "Xapes", pvp: 2 },
  { nom: "Xapa petita", pvp: 1 },
  { nom: "Samarretes staff", pvp: 10 },
  { nom: "Bossa staff", pvp: 5 },
  { nom: "Samarreta anterior", pvp: 5 },
  { nom: "Bossa anterior", pvp: 2.5 },
];
const NOMS_BASE = PRODUCTES_BASE.map((p) => p.nom);

const REFERENCIA_2026: Record<string, number> = {
  "Samarretes": 443, "Bosses": 96, "Xapes": 3, "Xapa petita": 4,
  "Samarretes staff": 60, "Bossa staff": 5, "Samarreta anterior": 50, "Bossa anterior": 0,
};

const DIES_BASE = ["Previ", "Dia 1", "Dia 2", "Dia 3"];

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function ProducteRow({
  edicio,
  dia,
  fila,
  onRefresh,
}: {
  edicio: string;
  dia: string;
  fila: any;
  onRefresh: () => void;
}) {
  const [unitats, setUnitats] = useState(fila.quantitat ?? "");
  const [pvp, setPvp] = useState(fila.pvp ?? "");

  const total = Number(unitats || 0) * Number(pvp || 0);

  const desar = async () => {
    await supabase.from("mercha").upsert(
      { edicio, dia, article: fila.article, quantitat: unitats === "" ? null : Number(unitats), pvp: pvp === "" ? null : Number(pvp), total },
      { onConflict: "edicio,dia,article" }
    );
    onRefresh();
  };

  return (
    <div className="linia">
      <span style={{ flex: 1.3, fontSize: 11 }}>{fila.article}</span>
      <input type="number" style={{ flex: 0.6 }} placeholder="0" value={unitats} onChange={(e) => setUnitats(e.target.value)} onBlur={desar} />
      <input type="number" style={{ flex: 0.7 }} value={pvp} onChange={(e) => setPvp(e.target.value)} onBlur={desar} />
      <span style={{ flex: 0.8, fontSize: 11, color: "var(--accent-amber)" }}>{fmt(total)}</span>
    </div>
  );
}

function AltreProducteRow({ fila, onRefresh }: { fila: any; onRefresh: () => void }) {
  const [nom, setNom] = useState(fila.article || "");
  const [unitats, setUnitats] = useState(fila.quantitat ?? "");
  const [pvp, setPvp] = useState(fila.pvp ?? 2.5);
  const total = Number(unitats || 0) * Number(pvp || 0);

  const desar = async () => {
    await supabase.from("mercha").update({ article: nom, quantitat: unitats === "" ? null : Number(unitats), pvp: Number(pvp), total }).eq("id", fila.id);
    onRefresh();
  };

  const eliminar = async () => {
    await supabase.from("mercha").delete().eq("id", fila.id);
    onRefresh();
  };

  return (
    <div className="linia">
      <input style={{ flex: 1.3 }} placeholder="Nom producte" value={nom} onChange={(e) => setNom(e.target.value)} onBlur={desar} />
      <input type="number" style={{ flex: 0.6 }} placeholder="0" value={unitats} onChange={(e) => setUnitats(e.target.value)} onBlur={desar} />
      <input type="number" style={{ flex: 0.7 }} value={pvp} onChange={(e) => setPvp(e.target.value)} onBlur={desar} />
      <span style={{ flex: 0.8, fontSize: 11, color: "var(--accent-amber)" }}>{fmt(total)}</span>
      <button className="link-btn" onClick={eliminar}>×</button>
    </div>
  );
}

function DiaCard({
  edicio,
  nom,
  files,
  onRenamed,
  onDeleted,
  onRefresh,
}: {
  edicio: string;
  nom: string;
  files: any[];
  onRenamed: (nouNom: string) => void;
  onDeleted: () => void;
  onRefresh: () => void;
}) {
  const [editantNom, setEditantNom] = useState(false);

  const filesBase = NOMS_BASE.map(
    (n) => files.find((f) => f.article === n) || { article: n, quantitat: "", pvp: PRODUCTES_BASE.find((p) => p.nom === n)!.pvp }
  );
  const filesExtra = files.filter((f) => !NOMS_BASE.includes(f.article));

  const totalDia = files.reduce((s, f) => s + Number(f.total || 0), 0) +
    filesBase.filter((f) => !f.id).reduce((s) => s, 0); // les virtuals encara no compten (total 0 fins que es desin)

  const renombrar = async (nouNom: string) => {
    if (nouNom && nouNom !== nom) {
      await supabase.from("mercha").update({ dia: nouNom }).eq("edicio", edicio).eq("dia", nom);
      onRenamed(nouNom);
    }
    setEditantNom(false);
  };

  const eliminarDia = async () => {
    await supabase.from("mercha").delete().eq("edicio", edicio).eq("dia", nom);
    onDeleted();
  };

  const afegirAltre = async () => {
    await supabase.from("mercha").insert({ edicio, dia: nom, article: "", quantitat: null, pvp: 2.5, total: 0 });
    onRefresh();
  };

  return (
    <div className="card">
      <div className="card-top">
        {editantNom ? (
          <input autoFocus className="dia-nom" defaultValue={nom} onBlur={(e) => renombrar(e.target.value)} onKeyDown={(e) => e.key === "Enter" && renombrar((e.target as HTMLInputElement).value)} />
        ) : (
          <span className="dia-nom" onClick={() => setEditantNom(true)} style={{ cursor: "pointer" }}>{nom}</span>
        )}
        <span className="dia-total">{fmt(totalDia)}</span>
        <button className="link-btn" onClick={eliminarDia} title="Eliminar dia">×</button>
      </div>

      <div className="capcalera-linia">
        <span style={{ flex: 1.3 }}>Producte</span>
        <span style={{ flex: 0.6 }}>Uds</span>
        <span style={{ flex: 0.7 }}>PVP</span>
        <span style={{ flex: 0.8 }}>Total</span>
      </div>

      {filesBase.map((f) => (
        <ProducteRow key={f.article} edicio={edicio} dia={nom} fila={f} onRefresh={onRefresh} />
      ))}
      {filesExtra.map((f) => (
        <AltreProducteRow key={f.id} fila={f} onRefresh={onRefresh} />
      ))}

      <button className="add-linia" onClick={afegirAltre}>+ afegir altre producte</button>
    </div>
  );
}

export default function MerchaCards({ edicio }: { edicio: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [diesExtra, setDiesExtra] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from("mercha").select("*").eq("edicio", edicio);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    setDiesExtra([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const diesDB = Array.from(new Set(rows.map((r) => r.dia)));
  const nomsDies = Array.from(new Set([...DIES_BASE, ...diesDB, ...diesExtra]));

  const afegirDia = () => setDiesExtra([...diesExtra, `Dia ${nomsDies.length}`]);

  const totalGeneral = rows.reduce((s, r) => s + Number(r.total || 0), 0);
  const totalsPerProducte: Record<string, number> = {};
  NOMS_BASE.forEach((n) => { totalsPerProducte[n] = 0; });
  rows.forEach((r) => { totalsPerProducte[r.article] = (totalsPerProducte[r.article] || 0) + Number(r.total || 0); });

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="link-line">
        <div><span className="dim">Total mercha:</span> <b>{fmt(totalGeneral)}</b></div>
      </div>

      <div className="grid">
        {nomsDies.map((nom) => (
          <DiaCard
            key={nom}
            edicio={edicio}
            nom={nom}
            files={rows.filter((r) => r.dia === nom)}
            onRenamed={() => { carregar(); }}
            onDeleted={() => { setDiesExtra(diesExtra.filter((d) => d !== nom)); carregar(); }}
            onRefresh={carregar}
          />
        ))}
      </div>

      <button className="btn" onClick={afegirDia}>+ Afegir dia</button>

      <div className="eyebrow" style={{ marginTop: 28 }}>Comparativa per producte</div>
      <table>
        <thead><tr><th>Producte</th><th>2026 (real)</th><th>2027 (real, fins ara)</th></tr></thead>
        <tbody>
          {NOMS_BASE.map((n) => (
            <tr key={n}>
              <td>{n}</td>
              <td className="dim">{fmt(REFERENCIA_2026[n] || 0)}</td>
              <td style={{ color: "var(--accent-amber)" }}>{fmt(totalsPerProducte[n] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
