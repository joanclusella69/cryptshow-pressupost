"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Field, EDICIONS } from "@/lib/fields";

interface DataBlockProps {
  tableName: string;
  fields: Field[];
  title: string;
  eyebrow: string;
  // Permet que els camps (p.ex. les opcions de "categoria") canviïn
  // segons els valors actuals del formulari (cas de Moviments).
  resolveFields?: (values: Record<string, any>) => Field[];
}

function emptyValues(fields: Field[]) {
  const v: Record<string, any> = {};
  fields.forEach((f) => {
    v[f.key] = f.type === "boolean" ? false : "";
  });
  return v;
}

export default function DataBlock({ tableName, fields, title, eyebrow, resolveFields }: DataBlockProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>(() => emptyValues(fields));
  const [filterEdicio, setFilterEdicio] = useState<string>(EDICIONS[0]);

  const effectiveFields = resolveFields ? resolveFields(values) : fields;

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(tableName).select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const afegir = async () => {
    const payload: Record<string, any> = {};
    for (const f of effectiveFields) {
      if (f.type === "number") payload[f.key] = values[f.key] === "" ? null : Number(values[f.key]);
      else payload[f.key] = values[f.key];
    }
    const requiredMissing = effectiveFields.some((f) => f.required && !payload[f.key] && payload[f.key] !== 0);
    if (requiredMissing) {
      setError("Omple els camps obligatoris abans d'afegir.");
      return;
    }
    setError(null);
    const { error } = await supabase.from(tableName).insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setValues(emptyValues(fields));
    carregar();
  };

  const eliminar = async (id: string) => {
    await supabase.from(tableName).delete().eq("id", id);
    carregar();
  };

  const filtrades = useMemo(
    () => rows.filter((r) => !filterEdicio || r.edicio === filterEdicio),
    [rows, filterEdicio]
  );

  const numericFields = fields.filter((f) => f.type === "number");
  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    numericFields.forEach((f) => {
      t[f.key] = filtrades.reduce((s, r) => s + (Number(r[f.key]) || 0), 0);
    });
    return t;
  }, [filtrades, numericFields]);

  return (
    <section style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16,
        }}
      >
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
        <select value={filterEdicio} onChange={(e) => setFilterEdicio(e.target.value)}>
          {EDICIONS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "#d38b90", fontSize: 13 }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        {effectiveFields.map((f) => (
          <div key={f.key} style={{ flex: f.width === "full" ? "1 1 100%" : "0 0 auto" }}>
            {f.type === "select" ? (
              <select
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              >
                <option value="">{f.label}</option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "boolean" ? (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={!!values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            ) : (
              <input
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                placeholder={f.label}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                style={{ width: f.width === "full" ? "100%" : undefined }}
              />
            )}
          </div>
        ))}
        <button className="btn" onClick={afegir}>Afegir</button>
      </div>

      {loading ? (
        <p className="empty">Carregant…</p>
      ) : filtrades.length === 0 ? (
        <p className="empty">Cap registre per a aquesta edició encara.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {fields.map((f) => <th key={f.key}>{f.label}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {filtrades.map((r) => (
              <tr key={r.id}>
                {fields.map((f) => (
                  <td key={f.key}>
                    {f.type === "boolean" ? (r[f.key] ? "Sí" : "No") : r[f.key]}
                  </td>
                ))}
                <td><button className="link-btn" onClick={() => eliminar(r.id)}>eliminar</button></td>
              </tr>
            ))}
          </tbody>
          {numericFields.length > 0 && (
            <tfoot>
              <tr>
                {fields.map((f) => (
                  <td key={f.key}>
                    {f.type === "number" ? `${totals[f.key].toLocaleString("ca-ES")} €` : (f.key === fields[0].key ? "Total" : "")}
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </section>
  );
}
