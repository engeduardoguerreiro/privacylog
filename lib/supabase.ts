import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ptdeanjznvskgzgejdxx.supabase.co";
const supabaseKey = "sb_publishable_0SibZaKPSfpovJj2q5RURA_Szg5b44b";

export const supabase = createClient(supabaseUrl, supabaseKey);