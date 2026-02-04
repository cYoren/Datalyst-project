/**
 * Compute and verify EAS Schema UID
 * 
 * Computes the schemaUID for our schema and checks if it's already registered.
 */

import { createPublicClient, http, keccak256, encodePacked } from 'viem';
import { base } from 'viem/chains';

const SCHEMA = 'bytes32 dataHash, string experimentId, string protocolId, uint64 timestamp';
const RESOLVER = '0x0000000000000000000000000000000000000000';
const REVOCABLE = false;

// Compute schema UID: keccak256(abi.encodePacked(schema, resolver, revocable))
const schemaUID = keccak256(
    encodePacked(
        ['string', 'address', 'bool'],
        [SCHEMA, RESOLVER, REVOCABLE]
    )
);

console.log('\n📋 Schema Definition:');
console.log(`   "${SCHEMA}"`);
console.log(`\n🔑 Computed Schema UID:`);
console.log(`   ${schemaUID}`);
console.log(`\n📎 View on EAS Explorer:`);
console.log(`   https://base.easscan.org/schema/view/${schemaUID}`);
console.log(`\n📝 Add to your .env.local:`);
console.log(`   EAS_SCHEMA_UID=${schemaUID}`);

// Verify it exists on-chain
async function verify() {
    const client = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org'),
    });

    // Check if schema exists by calling getSchema
    const SCHEMA_REGISTRY_ABI = [
        {
            name: 'getSchema',
            type: 'function',
            inputs: [{ name: 'uid', type: 'bytes32' }],
            outputs: [
                {
                    name: '',
                    type: 'tuple',
                    components: [
                        { name: 'uid', type: 'bytes32' },
                        { name: 'resolver', type: 'address' },
                        { name: 'revocable', type: 'bool' },
                        { name: 'schema', type: 'string' },
                    ],
                },
            ],
            stateMutability: 'view',
        },
    ] as const;

    try {
        const result = await client.readContract({
            address: '0x4200000000000000000000000000000000000020',
            abi: SCHEMA_REGISTRY_ABI,
            functionName: 'getSchema',
            args: [schemaUID as `0x${string}`],
        });

        if (result.schema === SCHEMA) {
            console.log('\n✅ Schema is already registered on Base Mainnet!');
        } else if (result.schema) {
            console.log('\n⚠️  Different schema found at this UID:', result.schema);
        } else {
            console.log('\n❌ Schema not found - needs to be registered');
        }
    } catch (e) {
        console.log('\n❌ Could not verify schema on-chain:', e);
    }
}

verify();
