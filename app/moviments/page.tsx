"use client";

import { useState } from "react";
import { EDICIONS, CATEGORIES_INGRES } from "@/lib/fields";
import DespesesCards from "@/components/DespesesCards";
import MovimentBloc from "@/components/MovimentBloc";

export default function MovimentsPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);

  return (
    <section style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16,
        }}
      >
        <div>
          <div className="eyebrow">Per partida · previst vs real</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 24 }}>Despeses i ingressos</h1>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <h2 style={{ marginBottom: 16 }}>Despeses</h2>
      <DespesesCards edicio={edicio} />

      <div style={{ marginTop: 40 }}>
        <MovimentBloc edicio={edicio} tipus="ingres" titol="Ingressos" categories={CATEGORIES_INGRES} />
      </div>
    </section>
  );
}
