"use client";

import { useState } from "react";
import { EDICIONS } from "@/lib/fields";
import CryptshowBloc from "@/components/CryptshowBloc";

export default function CryptshowPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);

  return (
    <section style={{ maxWidth: 800 }}>
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
          <div className="eyebrow">Resum d'ingressos propis</div>
          <h2>Cryptshow</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <CryptshowBloc edicio={edicio} />
    </section>
  );
}
