"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fmt = (n: number) => `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function CampPreu({ value, onChange }: { value: any; onChange: (v: string) => void }) {
  return (
    <span className="input-eur">
      <input type="number" placeholder="0" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <span className="eur-suffix">€</span>
    </span>
  );
}

function obrirInforme(despeses: any[], ingressos: any[], totals: any) {
  const files = despeses
    .map((d, i) => `<tr><td>${i + 1}</td><td>${d.concepte}</td><td>${fmt(d.subv_base)}</td><td>${fmt(d.subv_iva)}</td><td>${fmt(d.subv_irpf)}</td><td>${fmt(d.real)}</td></tr>`)
    .join("");
  const filesIngres = ingressos.map((r) => `<tr><td>${r.concepte}</td><td>${fmt(r.import)}</td></tr>`).join("");
  const html = `
    <html><head><meta charset="utf-8" /><title>Memòria econòmica</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 48px; }
      h1 { font-size: 20px; margin-bottom: 4px; } h2 { font-size: 14px; margin-top: 32px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
      .total { text-align: right; font-weight: bold; margin-top: 8px; }
    </style></head>
    <body>
      <h1>Cryptshow Festival · Memòria econòmica</h1>
      <h2>Despeses</h2>
      <table><thead><tr><th>Nº</th><th>Concepte</th><th>Base</th><th>IVA</th><th>IRPF</th><th>Total</th></tr></thead><tbody>${files}</tbody></table>
      <div class="total">Base ${fmt(totals.base)} · IVA ${fmt(totals.iva)} · IRPF ${fmt(totals.irpf)} · Total ${fmt(totals.despeses)}</div>
      <h2>Ingressos</h2>
      <table><thead><tr><th>Concepte</th><th>Import</th></tr></thead><tbody>${filesIngres}</tbody></table>
      <div class="total">Total ingressos: ${fmt(totals.ingressos)}</div>
      <script>window.onload = () => window.print();</script>
    </body></html>
  `;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

export default function SubvencionsCards({ edicio }: { edicio: string }) {
  const [despeses, setDespeses] = useState<any[]>([]);
  const [ingressos, setIngressos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [d, i] = await Promise.all([
        supabase.from("moviments").select("*").eq("edicio", edicio).eq("tipus", "despesa").eq("subvencio", true).order("data"),
        supabase.from("subvencions_ingressos").select("*").eq("edicio", edicio).order("ordre"),
      ]);
      setDespeses(d.data || []);
      setIngressos(i.data || []);
      setLoading(false);
    };
    carregar();
  }, [edicio]);

  const onDespesaChange = (id: string, camp: string, valor: any) => {
    setDespeses((prev) => prev.map((d) => (d.id === id ? { ...d, [camp]: valor } : d)));
    supabase.from("moviments").update({ [camp]: valor === "" ? null : valor }).eq("id", id).then(() => {});
  };

  const onIngresChange = (id: string, camp: string, valor: any) => {
    setIngressos((prev) => prev.map((r) => (r.id === id ? { ...r, [camp]: valor } : r)));
    supabase.from("subvencions_ingressos").update({ [camp]: valor === "" ? null : valor }).eq("id", id).then(() => {});
  };
  const onIngresDelete = (id: string) => {
    setIngressos((prev) => prev.filter((r) => r.id !== id));
    supabase.from("subvencions_ingressos").delete().eq("id", id).then(() => {});
  };
  const onIngresAdd = async () => {
    const { data } = await supabase.from("subvencions_ingressos").insert({ edicio, concepte: "", import: 0, ordre: ingressos.length }).select().single();
    if (data) setIngressos((prev) => [...prev, data]);
  };

  if (loading) return <p className="empty">Carregant…</p>;

  const totalBase = despeses.reduce((s, d) => s + Number(d.subv_base || 0), 0);
  const totalIva = despeses.reduce((s, d) => s + Number(d.subv_iva || 0), 0);
  const totalIrpf = despeses.reduce((s, d) => s + Number(d.subv_irpf || 0), 0);
  const totalDespeses = despeses.reduce((s, d) => s + Number(d.real || 0), 0);
  const totalIngressos = ingressos.reduce((s, r) => s + Number(r.import || 0), 0);

  return (
    <div>
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16, marginTop: 0 }}>Despeses (factures marcades a Proveïdors)</h2>
      {despeses.length === 0 ? (
        <p className="empty">Cap factura marcada encara. Ves a "Proveïdors" i marca "Subv." a les que calgui.</p>
      ) : (
        <table>
          <thead><tr><th>Nº</th><th>Concepte</th><th>Base</th><th>IVA</th><th>IRPF</th><th>Total (de Proveïdors)</th></tr></thead>
          <tbody>
            {despeses.map((d, i) => {
              const calculat = Number(d.subv_base || 0) + Number(d.subv_iva || 0) - Number(d.subv_irpf || 0);
              const diferencia = Math.abs(calculat - Number(d.real || 0)) > 0.02;
              return (
                <tr key={d.id}>
                  <td className="dim">{i + 1}</td>
                  <td>{d.concepte}{d.acreedor ? ` · ${d.acreedor}` : ""}</td>
                  <td><CampPreu value={d.subv_base} onChange={(v) => onDespesaChange(d.id, "subv_base", v === "" ? "" : Number(v))} /></td>
                  <td><CampPreu value={d.subv_iva} onChange={(v) => onDespesaChange(d.id, "subv_iva", v === "" ? "" : Number(v))} /></td>
                  <td><CampPreu value={d.subv_irpf} onChange={(v) => onDespesaChange(d.id, "subv_irpf", v === "" ? "" : Number(v))} /></td>
                  <td style={{ color: "var(--accent-amber)" }}>
                    {fmt(d.real)}
                    {diferencia && <span title="Base + IVA − IRPF no coincideix amb el Total" style={{ color: "#d38b90", marginLeft: 4 }}>⚠</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="empty" style={{ marginTop: 8 }}>
        Base {fmt(totalBase)} · IVA {fmt(totalIva)} · IRPF {fmt(totalIrpf)} · <b style={{ color: "var(--accent-amber)" }}>Total {fmt(totalDespeses)}</b>
      </p>

      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16 }}>Ingressos</h2>
      <table>
        <thead><tr><th>Concepte</th><th>Import</th><th /></tr></thead>
        <tbody>
          {ingressos.map((r) => (
            <tr key={r.id}>
              <td><input className="camp-text" value={r.concepte || ""} onChange={(e) => onIngresChange(r.id, "concepte", e.target.value)} /></td>
              <td><CampPreu value={r.import} onChange={(v) => onIngresChange(r.id, "import", v === "" ? "" : Number(v))} /></td>
              <td><button className="link-btn" onClick={() => onIngresDelete(r.id)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-linia" onClick={onIngresAdd}>+ Afegir línia d'ingrés</button>
      <p className="empty" style={{ marginTop: 8 }}><b style={{ color: "var(--accent-amber)" }}>Total ingressos: {fmt(totalIngressos)}</b></p>

      <button
        className="add-linia"
        style={{ marginTop: 20, borderStyle: "solid", borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
        onClick={() => obrirInforme(despeses, ingressos, { base: totalBase, iva: totalIva, irpf: totalIrpf, despeses: totalDespeses, ingressos: totalIngressos })}
      >
        📄 Descarregar memòria econòmica (PDF)
      </button>
    </div>
  );
}
