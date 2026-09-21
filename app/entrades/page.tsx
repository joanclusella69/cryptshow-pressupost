"use client";

import { useState } from "react";
import { EDICIONS } from "@/lib/fields";
import EntradesCards from "@/components/EntradesCards";

export default function EntradesPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);

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
          <div className="eyebrow">Venda de tiquets per dia i sessió</div>
          <h2>Entrades</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <EntradesCards edicio={edicio} />
    </section>
  );
}
