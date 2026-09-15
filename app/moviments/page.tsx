"use client";

import DataBlock from "@/components/DataBlock";
import { MOVIMENT_FIELDS, CATEGORIES_DESPESA, CATEGORIES_INGRES } from "@/lib/fields";

export default function MovimentsPage() {
  return (
    <DataBlock
      tableName="moviments"
      fields={MOVIMENT_FIELDS}
      title="Despeses i ingressos"
      eyebrow="Per partida · previst vs real"
      resolveFields={(values) =>
        MOVIMENT_FIELDS.map((f) =>
          f.key === "categoria"
            ? { ...f, options: values.tipus === "ingres" ? CATEGORIES_INGRES : CATEGORIES_DESPESA }
            : f
        )
      }
    />
  );
}
