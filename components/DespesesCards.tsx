"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES_DESPESA } from "@/lib/fields";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

interface Props {
  edicio: string;
}

function ApartatCard({
  categoria,
  edicio,
  previst,
  moviments,
  onPrevistChange,
  onRefresh,
}: {
  categoria: string;
  edicio: string;
  previst: number;
  moviments: any[];
  onPrevistChange: (valor: number) => void;
  onRefresh: () => void;
}) {
  const [concepte, setConcepte] = useState("");
  const [import_, setImport] = useState("");
  const [editantPrevist, setEditantPrevist] = useState(false);

  const real = moviments.reduce((s, m) => s + Number(m.real || 0), 0);
  const diferencia = previst - real;

  const afegir = async () => {
    if (!concepte.trim() || !import_) return;
    await supabase.from("moviments").insert({
      edicio,
      tipus: "despesa",
      categoria,
      data: new Date().toISOString().slice(0, 10),
      concepte,
      real: Number(import_),
    });
    setConcepte("");
    setImport("");
    onRefresh();
  };

  const eliminar = async (id: string) => {
    await supabase.from("moviments").delete().eq("id", id);
    onRefresh();
  };

  const desarPrevist = async (valor: number) => {
    await supabase.from("previstos").upsert(
      { edicio, tipus: "despesa", categoria, previst: valor },
      { onConflict: "edicio,tipus,categoria" }
    );
    onPrevistChange(valor);
    setEditantPrevist(false);
  };

  return (
    <div className="card">
      <div className="card-head">
        <h3>{categoria}</h3>
        <div className="card-nums">
          <div>
            <span className="dim">Previst</span>{" "}
            {editantPrevist ? (
              <input
                autoFocus
                type="number"
                defaultValue={previst}
                style={{ width: 80 }}
                onBlur={(e) => desarPrevist(Number(e.target.value) || 0)}
                onKeyDown={(e) => e.key === "Enter" && desarPrevist(Number((e.target as HTMLInputElement).value) || 0)}
              />
            ) : (
              <span onClick={() => setEditantPrevist(true)} style={{ cursor: "pointer", color: "var(--accent-amber)" }}>
                {fmt(previst)}
              </span>
            )}
          </div>
          <div><span className="dim">Real</span> <b style={{ color: "var(--accent-amber)" }}>{fmt(real)}</b></div>
          <div><span className="dim">Diferència</span> <span style={{ color: diferencia < 0 ? "#d38b90" : "var(--text-dim)" }}>{fmt(diferencia)}</span></div>
        </div>
      </div>

      <div className="card-form">
        <input
          placeholder="Concepte"
          value={concepte}
          onChange={(e) => setConcepte(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && afegir()}
        />
        <input
          type="number"
          placeholder="€"
          value={import_}
          onChange={(e) => setImport(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && afegir()}
          style={{ width: 80 }}
        />
        <button className="btn" onClick={afegir}>+</button>
      </div>

      {moviments.length > 0 && (
        <ul className="card-list">
          {moviments.map((m) => (
            <li key={m.id}>
              <span>{m.concepte}</span>
              <span>{fmt(m.real)}</span>
              <button className="link-btn" onClick={() => eliminar(m.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DespesesCards({ edicio }: Props) {
  const [moviments, setMoviments] = useState<any[]>([]);
  const [previstos, setPrevistos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [mov, prev] = await Promise.all([
      supabase.from("moviments").select("*").eq("edicio", edicio).eq("tipus", "despesa"),
      supabase.from("previstos").select("categoria, previst").eq("edicio", edicio).eq("tipus", "despesa"),
    ]);
    setMoviments(mov.data || []);
    const p: Record<string, number> = {};
    (prev.data || []).forEach((row: any) => { p[row.categoria] = Number(row.previst || 0); });
    setPrevistos(p);
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
          previst={previstos[c] || 0}
          moviments={moviments.filter((m) => m.categoria === c)}
          onPrevistChange={(v) => setPrevistos({ ...previstos, [c]: v })}
          onRefresh={carregar}
        />
      ))}
    </div>
  );
}
