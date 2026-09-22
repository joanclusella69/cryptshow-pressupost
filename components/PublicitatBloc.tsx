"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ESTATS = ["Pendent demanar", "Demanat", "OK", "Igual que any anterior"];
const DOCUMENTACIO = ["Cap", "Rebut", "Factura"];

const fmt = (n: number) =>
  `${Number(n || 0).toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function obrirFactura(sponsor: any) {
  const num = `CS27-${String(sponsor.id).slice(0, 8)}`;
  const data = sponsor.factura_data || new Date().toISOString().slice(0, 10);
  const importFactura = sponsor.factura_import ?? sponsor.confirmat ?? 0;
  const html = `
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Factura ${num}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 48px; max-width: 720px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 28px; }
        .header img { height: 64px; }
        .header .meta { font-size: 12px; color: #555; text-align: right; }
        .parties { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
        .party { flex: 1; }
        .party h2 { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #777; margin: 0 0 6px; }
        .party p { margin: 1px 0; font-size: 13px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { text-align: left; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: #777; border-bottom: 1px solid #111; padding: 8px 4px; }
        td { padding: 12px 4px; border-bottom: 1px solid #ddd; font-size: 13px; }
        .total-row { display: flex; justify-content: flex-end; padding-top: 12px; }
        .total-row .label { font-size: 12px; color: #555; margin-right: 16px; padding-top: 4px; }
        .total-row .amount { font-size: 22px; font-weight: bold; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${window.location.origin}/logo-crypts.png" alt="The Crypts" />
        <div class="meta">
          <div style="font-size:14px;font-weight:bold;color:#111;margin-bottom:4px;">FACTURA</div>
          <div>Núm. ${num}</div>
          <div>Data: ${data}</div>
        </div>
      </div>
      <div class="parties">
        <div class="party">
          <h2>Emès per</h2>
          <p><strong>The Crypts Productions</strong></p>
          <p>Santa Maria 71, 1r</p>
          <p>08911 Badalona</p>
          <p>NIF G63972426</p>
        </div>
        <div class="party">
          <h2>Facturat a</h2>
          <p><strong>${sponsor.factura_nom_fiscal || sponsor.anunciant}</strong></p>
          <p>${sponsor.factura_nif_cif || ""}</p>
          <p>${sponsor.factura_adreca || ""}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Concepte</th><th style="text-align:right;">Import</th></tr></thead>
        <tbody>
          <tr>
            <td>${sponsor.factura_concepte || `Publicitat Cryptshow Festival — ${sponsor.anunciant}`}</td>
            <td style="text-align:right;">${fmt(importFactura)}</td>
          </tr>
        </tbody>
      </table>
      <div class="total-row">
        <div class="label">Total</div>
        <div class="amount">${fmt(importFactura)}</div>
      </div>
      <div class="footer">Cryptshow Festival · The Crypts Productions</div>
      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

function SponsorCard({ s, onChange, onDelete }: { s: any; onChange: (camp: string, valor: any) => void; onDelete: () => void }) {
  const [encongida, setEncongida] = useState(false);
  const [facturaOberta, setFacturaOberta] = useState(true);
  const documentacio = s.documentacio || "Cap";

  if (encongida) {
    return (
      <div className="card card-mini" onClick={() => setEncongida(false)} title="Fes clic per expandir">
        <span className="mini-nom">{s.anunciant || "(sense nom)"}</span>
        <span className="mini-confirmat">{fmt(s.confirmat)}</span>
        <span className="mini-estat">{s.estat}</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-top">
        <button className="link-btn" onClick={() => setEncongida(true)} title="Encongir">−</button>
        <input
          className="anunciant"
          value={s.anunciant || ""}
          placeholder="Nom de l'anunciant"
          onChange={(e) => onChange("anunciant", e.target.value)}
        />
        <button className="link-btn" onClick={onDelete} title="Eliminar">×</button>
      </div>
      <div className="row">
        <label>Previst<input type="number" value={s.previst ?? ""} onChange={(e) => onChange("previst", Number(e.target.value) || 0)} /></label>
        <label>Confirmat<input type="number" value={s.confirmat ?? ""} onChange={(e) => onChange("confirmat", Number(e.target.value) || 0)} /></label>
      </div>
      <div className="row">
        <label>Estat
          <select value={s.estat || ESTATS[0]} onChange={(e) => onChange("estat", e.target.value)}>
            {ESTATS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>Encarregat/da<input value={s.encarregat || ""} onChange={(e) => onChange("encarregat", e.target.value)} /></label>
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <label style={{ flex: "none", width: "100%" }}>Documentació
          <select value={documentacio} onChange={(e) => onChange("documentacio", e.target.value)}>
            {DOCUMENTACIO.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {documentacio === "Factura" && (
        <div className="factura-panel">
          <button className="factura-toggle" onClick={() => setFacturaOberta(!facturaOberta)}>
            <span>{facturaOberta ? "▾" : "▸"} Dades factura</span>
          </button>
          {facturaOberta && (
            <>
              <label>Nom fiscal / Raó social
                <input value={s.factura_nom_fiscal || ""} onChange={(e) => onChange("factura_nom_fiscal", e.target.value)} placeholder={s.anunciant} />
              </label>
              <label>NIF / CIF
                <input value={s.factura_nif_cif || ""} onChange={(e) => onChange("factura_nif_cif", e.target.value)} />
              </label>
              <label>Adreça fiscal
                <input value={s.factura_adreca || ""} onChange={(e) => onChange("factura_adreca", e.target.value)} />
              </label>
              <div className="row">
                <label>Concepte
                  <input value={s.factura_concepte || ""} onChange={(e) => onChange("factura_concepte", e.target.value)} placeholder="Publicitat Cryptshow Festival XXI" />
                </label>
                <label>Import
                  <input type="number" value={s.factura_import ?? s.confirmat ?? ""} onChange={(e) => onChange("factura_import", Number(e.target.value) || 0)} />
                </label>
              </div>
              <label>Data
                <input type="date" value={s.factura_data || ""} onChange={(e) => onChange("factura_data", e.target.value)} />
              </label>
              <button className="btn-download" onClick={() => obrirFactura(s)}>📄 Generar / descarregar factura</button>
            </>
          )}
        </div>
      )}

      <label className="cobrat">
        <input type="checkbox" checked={!!s.cobrat} onChange={(e) => onChange("cobrat", e.target.checked)} />
        Cobrat
      </label>
    </div>
  );
}

export default function PublicitatBloc({ edicio }: { edicio: string }) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from("publicitat").select("*").eq("edicio", edicio).order("created_at");
    let sponsorsData = data || [];
    if (sponsorsData.length === 0) {
      const inicials = [
        { edicio, anunciant: "La Donzella", previst: 600, confirmat: 600, estat: "Igual que any anterior", encarregat: "Joan", cobrat: true },
        { edicio, anunciant: "Oscar", previst: 100, confirmat: 100, estat: "Igual que any anterior", encarregat: "Joan", cobrat: true },
        { edicio, anunciant: "Mexclat", previst: 250, confirmat: 250, estat: "Igual que any anterior", encarregat: "David", cobrat: false },
        { edicio, anunciant: "Caño 14", previst: 100, confirmat: 100, estat: "Igual que any anterior", encarregat: "Joan", cobrat: true },
        { edicio, anunciant: "La màquina del temps", previst: 65, confirmat: 0, estat: "Demanat", encarregat: "Joan", cobrat: false },
        { edicio, anunciant: "Farmàcia Villoria", previst: 100, confirmat: 100, estat: "Igual que any anterior", encarregat: "David", cobrat: true },
        { edicio, anunciant: "Free Style", previst: 45, confirmat: 45, estat: "Igual que any anterior", encarregat: "Joan", cobrat: true },
        { edicio, anunciant: "Casa Costa", previst: 100, confirmat: 100, estat: "Igual que any anterior", encarregat: "Sonia", cobrat: true },
        { edicio, anunciant: "Calavera", previst: 45, confirmat: 45, estat: "Igual que any anterior", encarregat: "Toni", cobrat: false },
        { edicio, anunciant: "Fimons", previst: 45, confirmat: 0, estat: "Pendent demanar", encarregat: "David", cobrat: false },
        { edicio, anunciant: "Patxi", previst: 50, confirmat: 60, estat: "Igual que any anterior", encarregat: "David", cobrat: true },
        { edicio, anunciant: "Estraperlo", previst: 1000, confirmat: 1000, estat: "Igual que any anterior", encarregat: "David", cobrat: true },
        { edicio, anunciant: "Badamola", previst: 0, confirmat: 0, estat: "Pendent demanar", encarregat: "", cobrat: false },
        { edicio, anunciant: "Solimar", previst: 0, confirmat: 0, estat: "Pendent demanar", encarregat: "", cobrat: false },
      ];
      const { data: creats } = await supabase.from("publicitat").insert(inicials).select();
      sponsorsData = creats || [];
    }
    setSponsors(sponsorsData);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicio]);

  const actualitzar = async (id: string, camp: string, valor: any) => {
    setSponsors(sponsors.map((s) => (s.id === id ? { ...s, [camp]: valor } : s)));
    await supabase.from("publicitat").update({ [camp]: valor }).eq("id", id);
  };

  const eliminar = async (id: string) => {
    await supabase.from("publicitat").delete().eq("id", id);
    carregar();
  };

  const afegir = async () => {
    const { data } = await supabase
      .from("publicitat")
      .insert({ edicio, anunciant: "", previst: 0, confirmat: 0, estat: "Pendent demanar", cobrat: false })
      .select()
      .single();
    if (data) setSponsors([...sponsors, data]);
  };

  const totalConfirmat = sponsors.reduce((s, r) => s + Number(r.confirmat || 0), 0);
  const totalPrevist = sponsors.reduce((s, r) => s + Number(r.previst || 0), 0);

  if (loading) return <p className="empty">Carregant…</p>;

  return (
    <div>
      <div className="link-line">
        <div><span className="dim">Total previst:</span> <b>{fmt(totalPrevist)}</b></div>
        <div><span className="dim">Total confirmat:</span> <b>{fmt(totalConfirmat)}</b></div>
        <div className="dim">→ aquest confirmat és el <b style={{ color: "var(--accent-amber)" }}>Real</b> de "Publicitat i patrocinadors" a Ingressos</div>
      </div>

      {sponsors.length === 0 ? (
        <p className="empty">Cap esponsor encara per aquesta edició.</p>
      ) : (
        <div className="grid">
          {sponsors.map((s) => (
            <SponsorCard
              key={s.id}
              s={s}
              onChange={(camp, valor) => actualitzar(s.id, camp, valor)}
              onDelete={() => eliminar(s.id)}
            />
          ))}
        </div>
      )}

      <button className="btn" onClick={afegir} style={{ marginTop: 16 }}>+ Afegir esponsor</button>
    </div>
  );
}
