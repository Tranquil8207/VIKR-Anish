const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAllProducts() {
    console.log("Restoring all products to active...");

    const { error } = await supabase
        .from('products')
        .update({ is_active: true })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy UUID to update all

    if (error) {
        console.error("❌ Error setting products active:", error);
        return;
    }

    console.log("✅ Successfully restored all products to active (is_active = true).");
}

restoreAllProducts();
