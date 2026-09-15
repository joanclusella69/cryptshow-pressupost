"use client";

import DataBlock from "@/components/DataBlock";
import { MERCHA_FIELDS } from "@/lib/fields";

export default function MerchaPage() {
  return (
    <DataBlock
      tableName="mercha"
      fields={MERCHA_FIELDS}
      title="Mercha"
      eyebrow="Venda de marxandatge per dia i article"
    />
  );
}
