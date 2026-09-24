"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES_DESPESA } from "@/lib/fields";
import { getActivitatsPerFitxa } from "@/lib/activitatsTotal";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function ApartatCard({
  categoria,
  edicio,
  moviments,
  activitatsLinies,
  onRefresh,
}: {
  categoria: string;
  edicio: string;
  moviments: any[];
  activitatsLinies?: { nom: string; real: number }[];
  onRefresh: () => void;
}) {
  const [concepte, setConcepte] = useState("");
  const [acreedor, setAcreedor] = useState("");
  const [import_, setImport] = useState("");

  const totalActivitats = (activitatsLinies || []).reduce((s, a) => s + a.real, 0);
  const total = moviments.reduce((s, m) => s + Number(m.real || 0), 0) + totalActivitats;

  const afegir = async () => {
    if (!concepte.trim() || !import_) return;
    await supabase.from("moviments").insert({
      edicio,
      tipus: "despesa",
      categoria,
      data: new Date().toISOString().slice(0, 10),
      concepte,
      acreedor: acreedor || null,
      real: Number(import_),
      pagat: false,
    });
    setConcepte("");
    setAcreedor("");
    setImport("");
    onRefresh();
  };

  const eliminar = async (id: string) => {
    await supabase.from("moviments").delete().eq("id", id);
    onRefresh();
  };

  const togglePagat = async (id: string, valor: boolean) => {
    await supabase.from("moviments").update({ pagat: valor }).eq("id", id);
    onRefresh();
  };

  return (
    <div className="card">
      <div className="card-head">
        <h3>{categoria}</h3>
        <div className="card-nums">
          <div><span className="dim">Total</span> <b style={{ color: "var(--accent-amber)" }}>{fmt(total)}</b></div>
        </div>
      </div>

      {activitatsLinies && (
        <>
          <p className="auto-note">Vinguts de la pàgina "Activitats i convidats" (no editables aquí):</p>
          <ul className="card-list">
            {activitatsLinies.map((a) => (
              <li key={a.nom} style={{ alignItems: "center" }}>
                <span>{a.nom}</span>
                <span style={{ color: "var(--accent-amber)" }}>{fmt(a.real)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="card-form" style={{ flexWrap: "wrap" }}>
        <input
          placeholder="Concepte"
          value={concepte}
          onChange={(e) => setConcepte(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && afegir()}
          style={{ flex: "1 1 100px" }}
        />
        <input
          placeholder="Proveïdor"
          value={acreedor}
          onChange={(e) => setAcreedor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && afegir()}
          style={{ flex: "1 1 90px" }}
        />
        <input
          type="number"
          placeholder="€"
          value={import_}
          onChange={(e) => setImport(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && afegir()}
          style={{ width: 70 }}
        />
        <button className="btn" onClick={afegir}>+</button>
      </div>

      {moviments.length > 0 && (
        <ul className="card-list">
          {moviments.map((m) => (
            <li key={m.id} style={{ alignItems: "center" }}>
              <input type="checkbox" checked={!!m.pagat} onChange={(e) => togglePagat(m.id, e.target.checked)} title="Pagat" />
              <span>{m.concepte}{m.acreedor ? ` · ${m.acreedor}` : ""}</span>
              <span>{fmt(m.real)}</span>
              <button className="link-btn" onClick={() => eliminar(m.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProveidorsCards({ edicio }: { edicio: string }) {
  const [moviments, setMoviments] = useState<any[]>([]);
  const [activitats, setActivitats] = useState<{ nom: string; real: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [mov, act] = await Promise.all([
      supabase.from("moviments").select("*").eq("edicio", edicio).eq("tipus", "despesa"),
      getActivitatsPerFitxa(edicio),
    ]);
    setMoviments(mov.data || []);
    setActivitats(act.perFitxa);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div className="grid">
      {CATEGORIES_DESPESA.map((c) => (
        <ApartatCard
          key={c}
          categoria={c}
          edicio={edicio}
          moviments={moviments.filter((m) => m.categoria === c)}
          activitatsLinies={c === "Activitats i convidats" ? activitats : undefined}
          onRefresh={carregar}
        />
      ))}
    </div>
  );
}
