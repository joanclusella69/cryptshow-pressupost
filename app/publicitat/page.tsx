"use client";

import DataBlock from "@/components/DataBlock";
import { PUBLICITAT_FIELDS } from "@/lib/fields";

export default function PublicitatPage() {
  return (
    <DataBlock
      tableName="publicitat"
      fields={PUBLICITAT_FIELDS}
      title="Publicitat"
      eyebrow="Anunciants i patrocinadors"
    />
  );
}
