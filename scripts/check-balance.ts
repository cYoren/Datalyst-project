/**
 * Check wallet balance on Base networks
 * 
 * Usage: npx tsx scripts/check-balance.ts
 */

import { createPublicClient, http, formatEther, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    const privateKey = process.env.EAS_PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ EAS_PRIVATE_KEY not found');
        process.exit(1);
    }

    const account = privateKeyToAccount(privateKey as Hex);
    console.log(`\n👛 Wallet: ${account.address}\n`);

    // Check Base Mainnet
    const mainnetClient = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org'),
    });

    const mainnetBalance = await mainnetClient.getBalance({ address: account.address });
    console.log(`Base Mainnet:  ${formatEther(mainnetBalance)} ETH`);

    // Check Base Sepolia
    const sepoliaClient = createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org'),
    });

    const sepoliaBalance = await sepoliaClient.getBalance({ address: account.address });
    console.log(`Base Sepolia:  ${formatEther(sepoliaBalance)} ETH`);

    console.log('\n💡 If no balance on Base Sepolia, use the faucet:');
    console.log('   https://www.alchemy.com/faucets/base-sepolia');
    console.log('   https://faucet.quicknode.com/base/sepolia');
}

main().catch(console.error);
