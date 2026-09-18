"use client";

import { useState } from "react";
import { EDICIONS } from "@/lib/fields";
import MerchaCards from "@/components/MerchaCards";

export default function MerchaPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);

  return (
    <section style={{ maxWidth: 900 }}>
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
          <div className="eyebrow">Venda de marxandatge per dia i article</div>
          <h2>Mercha</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <MerchaCards edicio={edicio} />
    </section>
  );
}
