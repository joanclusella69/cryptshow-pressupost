"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CategoriaGrid from "@/components/CategoriaGrid";

const CATEGORIES_AUTOMATIQUES = ["Aportació Cryptshow", "Publicitat i patrocinadors"];

interface Props {
  edicio: string;
  tipus: "ingres" | "despesa";
  titol: string;
  categories: string[];
}

export default function MovimentBloc({ edicio, tipus, titol, categories }: Props) {
  const categoriesFormulari = categories.filter((c) => !CATEGORIES_AUTOMATIQUES.includes(c));
  const [form, setForm] = useState({ data: "", categoria: "", concepte: "", real: "", notes: "" });
  const [detall, setDetall] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const carregarDetall = async () => {
    const { data } = await supabase
      .from("moviments")
      .select("*")
      .eq("edicio", edicio)
      .eq("tipus", tipus)
      .order("data", { ascending: false });
    setDetall(data || []);
  };

  useEffect(() => {
    carregarDetall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio, tipus, refreshKey]);

  const afegir = async () => {
    if (!form.data || !form.categoria || !form.concepte.trim() || !form.real) {
      setError("Omple data, categoria, concepte i import.");
      return;
    }
    setError(null);
    const { error } = await supabase.from("moviments").insert({
      edicio,
      tipus,
      data: form.data,
      categoria: form.categoria,
      concepte: form.concepte,
      real: Number(form.real),
      notes: form.notes || null,
    });
    if (error) { setError(error.message); return; }
    setForm({ data: "", categoria: "", concepte: "", real: "", notes: "" });
    setRefreshKey((k) => k + 1);
  };

  const eliminar = async (id: string) => {
    await supabase.from("moviments").delete().eq("id", id);
    setRefreshKey((k) => k + 1);
  };

  const fmt = (n: number) => `${Number(n).toLocaleString("ca-ES")} €`;

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 16 }}>{titol}</h2>

      {error && <p style={{ color: "#d38b90", fontSize: 13 }}>{error}</p>}

      {tipus === "ingres" && (
        <p className="empty" style={{ marginBottom: 12 }}>
          "Publicitat i patrocinadors" i "Aportació Cryptshow" es calculen soles des dels apartats Publicitat i Cryptshow — no cal (ni es pot) afegir-hi moviments manuals aquí.
        </p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          <option value="">Categoria</option>
          {categoriesFormulari.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          placeholder="Concepte"
          value={form.concepte}
          onChange={(e) => setForm({ ...form, concepte: e.target.value })}
          style={{ flex: "1 1 200px" }}
        />
        <input
          type="number"
          placeholder="Import (€)"
          value={form.real}
          onChange={(e) => setForm({ ...form, real: e.target.value })}
          style={{ width: 110 }}
        />
        <input
          placeholder="Notes (opcional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ width: 160 }}
        />
        <button className="btn" onClick={afegir}>Afegir</button>
      </div>

      <div className="eyebrow">Resum per categoria</div>
      <CategoriaGrid edicio={edicio} tipus={tipus} categories={categories} refreshKey={refreshKey} />

      {detall.length > 0 && (
        <>
          <div className="eyebrow">Detall de moviments</div>
          <table>
            <thead>
              <tr><th>Data</th><th>Categoria</th><th>Concepte</th><th>Import</th><th /></tr>
            </thead>
            <tbody>
              {detall.map((m) => (
                <tr key={m.id}>
                  <td>{m.data}</td>
                  <td>{m.categoria}</td>
                  <td>{m.concepte}</td>
                  <td>{fmt(m.real)}</td>
                  <td><button className="link-btn" onClick={() => eliminar(m.id)}>eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
