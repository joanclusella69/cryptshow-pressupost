"use client";

import { useState } from "react";
import { EDICIONS, CATEGORIES_DESPESA, CATEGORIES_INGRES } from "@/lib/fields";
import CategoriaGrid from "@/components/CategoriaGrid";

export default function MovimentsPage() {
  const [edicio, setEdicio] = useState(EDICIONS[0]);
  const [refreshKey] = useState(0);

  return (
    <section style={{ maxWidth: 900 }}>
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

      <h2 style={{ marginBottom: 12 }}>Despeses</h2>
      <p className="empty" style={{ marginBottom: 12 }}>
        Els gastos concrets s'introdueixen a l'apartat "Proveïdors" — aquí només es veu el resum per categoria.
      </p>
      <CategoriaGrid edicio={edicio} tipus="despesa" categories={CATEGORIES_DESPESA} refreshKey={refreshKey} />

      <h2 style={{ margin: "32px 0 12px" }}>Ingressos</h2>
      <p className="empty" style={{ marginBottom: 12 }}>
        Fes clic sobre l'import de "Real" per escriure'l directament. "Publicitat i patrocinadors" i "Aportació Cryptshow" es calculen soles des dels seus propis apartats.
      </p>
      <CategoriaGrid edicio={edicio} tipus="ingres" categories={CATEGORIES_INGRES} refreshKey={refreshKey} />
    </section>
  );
}
