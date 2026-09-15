"use client";

import DataBlock from "@/components/DataBlock";
import { ENTRADA_FIELDS } from "@/lib/fields";

export default function EntradesPage() {
  return (
    <DataBlock
      tableName="entrades"
      fields={ENTRADA_FIELDS}
      title="Entrades"
      eyebrow="Venda de tiquets per dia i sessió"
    />
  );
}
