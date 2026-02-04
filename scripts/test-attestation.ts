/**
 * Test EAS Attestation
 * 
 * Creates a test attestation to verify the integration works.
 * 
 * Usage: npx tsx scripts/test-attestation.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import after dotenv so env vars are available
import { attestExperiment, type ExperimentData } from '../src/lib/crypto/eas';

const testData: ExperimentData = {
    experimentId: 'test-' + Date.now(),
    protocolId: 'magnesium-sleep-v1',
    name: 'Test Attestation',
    hypothesis: 'This is a test attestation',
    startDate: '2025-01-01',
    endDate: '2025-01-15',
    type: 'RANDOMIZED',
    isBlind: false,
    results: {
        effectSize: 0.45,
        pValue: 0.023,
        conditionAMean: 6.5,
        conditionBMean: 7.2,
        nA: 7,
        nB: 7,
    },
};

async function main() {
    console.log('\n🧪 Testing EAS Attestation on Base Mainnet...\n');
    console.log('Experiment:', testData.name);
    console.log('Effect size:', testData.results.effectSize);
    console.log('');

    const result = await attestExperiment(testData);

    if (result.success) {
        console.log('\n✅ Attestation created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Attestation UID: ${result.uid}`);
        console.log(`Transaction:     ${result.txHash}`);
        console.log(`Data Hash:       ${result.dataHash}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n📎 View on EAS Explorer:`);
        console.log(`   ${result.explorerUrl}`);
    } else {
        console.log('\n❌ Attestation failed:', result.error);
    }
}

main().catch(console.error);
