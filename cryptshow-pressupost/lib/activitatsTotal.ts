import { supabase } from "@/lib/supabaseClient";

export const FITXES_ACTIVITATS = ["LMPV", "Festival Convidat", "Jornada Literària", "Pel·lícula Musicada", "Sessió Asiàtica"];

export async function getActivitatsPerFitxa(edicio: string) {
  const [c, j] = await Promise.all([
    supabase.from("activitats_conceptes").select("fitxa, real").eq("edicio", edicio),
    supabase.from("activitats_jurat_convidats").select("transport_real, allotjament_real, dietes_real").eq("edicio", edicio),
  ]);

  const conceptes = c.data || [];
  const perFitxa = FITXES_ACTIVITATS.map((fitxa) => ({
    nom: fitxa,
    real: conceptes.filter((x: any) => x.fitxa === fitxa).reduce((s: number, x: any) => s + Number(x.real || 0), 0),
  }));

  const totalJuratReal = (j.data || []).reduce(
    (s: number, x: any) => s + Number(x.transport_real || 0) + Number(x.allotjament_real || 0) + Number(x.dietes_real || 0),
    0
  );
  perFitxa.push({ nom: "Jurat", real: totalJuratReal });

  const total = perFitxa.reduce((s, f) => s + f.real, 0);
  return { perFitxa, total };
}

export async function getTotalActivitats(edicio: string): Promise<number> {
  const { total } = await getActivitatsPerFitxa(edicio);
  return total;
}
