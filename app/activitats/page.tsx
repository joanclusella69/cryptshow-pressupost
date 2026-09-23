"use client";

import { useState } from "react";
import { EDICIONS } from "@/lib/fields";
import ActivitatsCards from "@/components/ActivitatsCards";

export default function ActivitatsPage() {
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
          <div className="eyebrow">Una fitxa per activitat, amb els seus propis conceptes</div>
          <h2>Activitats i convidats</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <ActivitatsCards edicio={edicio} />
    </section>
  );
}
