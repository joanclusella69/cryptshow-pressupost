"use client";

import { useState } from "react";
import { EDICIONS } from "@/lib/fields";
import SubvencionsCards from "@/components/SubvencionsCards";

export default function SubvencionsPage() {
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
          <div className="eyebrow">Memòria econòmica</div>
          <h2>Subvencions</h2>
        </div>
        <select value={edicio} onChange={(e) => setEdicio(e.target.value)}>
          {EDICIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <SubvencionsCards edicio={edicio} />
    </section>
  );
}
