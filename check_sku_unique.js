const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSkuUnique() {
    // A trick to verify the constraint indirectly or we can execute SQL directly using a raw query if available. 
    // For Supabase we must remove it via dashboard if we don't have postgres access directly
    console.log("To drop the `sku` unique constraint, please run `ALTER TABLE public.products DROP CONSTRAINT products_sku_key;` in the Supabase SQL Editor");
}

checkSkuUnique();
