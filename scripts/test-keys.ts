import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ccgprpgwntuaealojtch.supabase.co';
// Testing the "publishable" key as the anon key
const ANON_KEY = 'sb_publishable_KUmeU-U9JVqTZjjTy3p3Rg_YEVkBPRV';

// Testing the "legacy JWT" - unclear what this is, but let's log it
const LEGACY_SECRET = 'rwf2G/F1jwPSqvK2hIviwvFYStsTR5bDtXbyOR7YZM3EMlHeafrV0Wreyx9KJ90dQ/YKMHSogIQdVmWzXmbTUA==';

async function main() {
    console.log('Testing Supabase Connection with provided keys...\n');

    // 1. Test REST API with Anon Key
    try {
        console.log('1. Testing REST API (Anon Key)...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            console.log('   ✅ Key works! This is a valid API key.');
        } else {
            console.log('   ❌ Key failed. Response:', await response.text());
        }
    } catch (e) {
        console.error('   ❌ Network error:', e);
    }

    // 2. Test JS Client Initialization
    try {
        console.log('\n2. Testing Supabase JS Client...');
        const supabase = createClient(SUPABASE_URL, ANON_KEY);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('   ⚠️ Auth check failed:', error.message);
        } else {
            console.log('   ✅ Client initialized successfully.');
        }
    } catch (e) {
        console.error('   ❌ Client initialization error:', e);
    }
}

main();
