import { supabase } from "@/lib/supabaseClient";

export async function getTotalEntrades(edicio: string): Promise<number> {
  const [d, s, c] = await Promise.all([
    supabase.from("entrades_dies").select("id, te_abonaments, abonament_unitats, abonament_preu").eq("edicio", edicio),
    supabase.from("entrades_sessions").select("dia_id, unitats_taquilla, preu_taquilla, unitats_web, preu_web"),
    supabase.from("entrades_config").select("festival_unitats, festival_preu").eq("edicio", edicio).maybeSingle(),
  ]);

  const dies = d.data || [];
  const sessions = s.data || [];
  const diaIds = new Set(dies.map((x: any) => x.id));

  const totalSessions = sessions
    .filter((x: any) => diaIds.has(x.dia_id))
    .reduce((sum: number, x: any) => sum + Number(x.unitats_taquilla || 0) * Number(x.preu_taquilla || 0) + Number(x.unitats_web || 0) * Number(x.preu_web || 0), 0);

  const totalAbonamentsDia = dies.reduce(
    (sum: number, dd: any) => sum + (dd.te_abonaments ? Number(dd.abonament_unitats || 0) * Number(dd.abonament_preu || 0) : 0),
    0
  );

  const config = c.data;
  const totalFestival = config ? Number(config.festival_unitats || 0) * Number(config.festival_preu || 0) : 0;

  return totalSessions + totalAbonamentsDia + totalFestival;
}
