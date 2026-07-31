import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const id = "12a5a8b8-91ae-49aa-bc07-6617395f9b23";

const { data, error } = await supabase
  .from("cases")
  .select("*")
  .eq("id", id)
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
