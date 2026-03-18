const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAllProductsInactiveExceptOne() {
    console.log("Setting all products to inactive except the first one...");

    // 1. Fetch all product IDs
    const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('id, name')
        .order('name', { ascending: true });

    if (fetchError) {
        console.error("❌ Error fetching products:", fetchError);
        return;
    }

    if (!allProducts || allProducts.length === 0) {
        console.log("⚠️ No products found in the database.");
        return;
    }

    const firstProduct = allProducts[0];
    console.log(`Keeping product active: [${firstProduct.id}] ${firstProduct.name}`);

    // 2. Set all products to is_active = false
    const { error: updateAllError } = await supabase
        .from('products')
        .update({ is_active: false })
        // In Supabase, you can't easily do a true "update all without a filter" 
        // using the client library reliably without passing an array of IDs or using neq.
        // So we'll update where id is not equal to a dummy value (or just not the first product).
        .neq('id', firstProduct.id);

    if (updateAllError) {
        console.error("❌ Error setting products inactive:", updateAllError);
        return;
    }

    // Ensure the chosen one is active (in case it wasn't)
    const { error: updateOneError } = await supabase
        .from('products')
        .update({ is_active: true })
        .eq('id', firstProduct.id);

    if (updateOneError) {
        console.error("❌ Error ensuring first product is active:", updateOneError);
        return;
    }

    console.log("✅ Successfully updated products. Only ONE card should render now.");
}

setAllProductsInactiveExceptOne();
