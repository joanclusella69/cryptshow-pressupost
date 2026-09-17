"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface CategoriaGridProps {
  edicio: string;
  tipus: "ingres" | "despesa";
  categories: string[];
  refreshKey: number;
}

const CATEGORIES_AUTOMATIQUES = ["Aportació Cryptshow", "Publicitat i patrocinadors"];

export default function CategoriaGrid({ edicio, tipus, categories, refreshKey }: CategoriaGridProps) {
  const [reals, setReals] = useState<Record<string, number>>({});
  const [previstos, setPrevistos] = useState<Record<string, number>>({});
  const [movIds, setMovIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editant, setEditant] = useState<string | null>(null);
  const [editantReal, setEditantReal] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    const [mov, prev] = await Promise.all([
      supabase.from("moviments").select("id, categoria, real").eq("edicio", edicio).eq("tipus", tipus),
      supabase.from("previstos").select("categoria, previst").eq("edicio", edicio).eq("tipus", tipus),
    ]);
    const r: Record<string, number> = {};
    const ids: Record<string, string> = {};
    (mov.data || []).forEach((m: any) => {
      r[m.categoria] = (r[m.categoria] || 0) + Number(m.real || 0);
      if (!ids[m.categoria]) ids[m.categoria] = m.id;
    });
    setMovIds(ids);

    if (tipus === "ingres") {
      const [pub, ent, mer, altres] = await Promise.all([
        supabase.from("publicitat").select("confirmat").eq("edicio", edicio),
        supabase.from("entrades").select("caixa, web").eq("edicio", edicio),
        supabase.from("mercha").select("total").eq("edicio", edicio),
        supabase.from("cryptshow_altres").select("import").eq("edicio", edicio),
      ]);
      r["Publicitat i patrocinadors"] = (pub.data || []).reduce((s: number, p: any) => s + Number(p.confirmat || 0), 0);
      const totalEntrades = (ent.data || []).reduce((s: number, e: any) => s + Number(e.caixa || 0) + Number(e.web || 0), 0);
      const totalMercha = (mer.data || []).reduce((s: number, m: any) => s + Number(m.total || 0), 0);
      const totalAltres = (altres.data || []).reduce((s: number, a: any) => s + Number(a.import || 0), 0);
      r["Aportació Cryptshow"] = totalEntrades + totalMercha + totalAltres;
    }

    const p: Record<string, number> = {};
    (prev.data || []).forEach((row: any) => { p[row.categoria] = Number(row.previst || 0); });
    setReals(r);
    setPrevistos(p);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio, tipus, refreshKey]);

  const desarPrevist = async (categoria: string, valor: number) => {
    await supabase
      .from("previstos")
      .upsert({ edicio, tipus, categoria, previst: valor }, { onConflict: "edicio,tipus,categoria" });
    setPrevistos({ ...previstos, [categoria]: valor });
    setEditant(null);
  };

  const desarReal = async (categoria: string, valor: number) => {
    const idExistent = movIds[categoria];
    if (idExistent) {
      await supabase.from("moviments").update({ real: valor }).eq("id", idExistent);
    } else {
      const { data } = await supabase
        .from("moviments")
        .insert({ edicio, tipus, categoria, data: new Date().toISOString().slice(0, 10), concepte: "Ingrés", real: valor })
        .select()
        .single();
      if (data) setMovIds({ ...movIds, [categoria]: data.id });
    }
    setReals({ ...reals, [categoria]: valor });
    setEditantReal(null);
  };

  const totalPrevist = categories.reduce((s, c) => s + (previstos[c] || 0), 0);
  const totalReal = categories.reduce((s, c) => s + (reals[c] || 0), 0);
  const fmt = (n: number) => `${n.toLocaleString("ca-ES")} €`;

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <table style={{ marginBottom: 24 }}>
      <thead>
        <tr>
          <th>Categoria</th>
          <th>Previst</th>
          <th>Real</th>
          <th>Diferència</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((c) => {
          const previst = previstos[c] || 0;
          const real = reals[c] || 0;
          const diff = previst - real;
          const automatica = CATEGORIES_AUTOMATIQUES.includes(c);
          return (
            <tr key={c}>
              <td>{c}{automatica && <span style={{ fontSize: 10, color: "var(--text-dim)" }}> (automàtic)</span>}</td>
              <td
                onClick={() => setEditant(c)}
                style={{ cursor: "pointer", color: "var(--accent-amber)" }}
                title="Fes clic per editar"
              >
                {editant === c ? (
                  <input
                    autoFocus
                    type="number"
                    defaultValue={previst}
                    style={{ width: 90 }}
                    onBlur={(e) => desarPrevist(c, Number(e.target.value) || 0)}
                    onKeyDown={(e) => e.key === "Enter" && desarPrevist(c, Number((e.target as HTMLInputElement).value) || 0)}
                  />
                ) : (
                  fmt(previst)
                )}
              </td>
              {tipus === "ingres" && !automatica ? (
                <td
                  onClick={() => setEditantReal(c)}
                  style={{ cursor: "pointer", color: "var(--accent-amber)" }}
                  title="Fes clic per escriure l'import"
                >
                  {editantReal === c ? (
                    <input
                      autoFocus
                      type="number"
                      defaultValue={real}
                      style={{ width: 90 }}
                      onBlur={(e) => desarReal(c, Number(e.target.value) || 0)}
                      onKeyDown={(e) => e.key === "Enter" && desarReal(c, Number((e.target as HTMLInputElement).value) || 0)}
                    />
                  ) : (
                    fmt(real)
                  )}
                </td>
              ) : (
                <td>{real ? fmt(real) : ""}</td>
              )}
              <td style={{ color: diff < 0 ? "#d38b90" : "var(--text-dim)" }}>{fmt(diff)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td>{fmt(totalPrevist)}</td>
          <td>{fmt(totalReal)}</td>
          <td>{fmt(totalPrevist - totalReal)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
