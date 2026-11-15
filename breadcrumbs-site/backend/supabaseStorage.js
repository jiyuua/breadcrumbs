
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET;

if (!supabaseUrl || !supabaseSecretKey || !storageBucket) {
  throw new Error("Missing Supabase Storage environment variables");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

module.exports = {
  supabase,
  storageBucket,
};
