import { PrismaClient } from '@prisma/client';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

const HOST = 'aws-1-us-east-1.pooler.supabase.com';
const PASSWORD = 'Datalyst2024';
const USER = 'postgres.ccgprpgwntuaealojtch'; // Pooler username format

async function testConnection(port: number) {
    const url = `postgresql://${USER}:${PASSWORD}@${HOST}:${port}/postgres?pgbouncer=true`;
    console.log(`\nTesting connection to ${HOST} on port ${port}...`);

    const prisma = new PrismaClient({
        datasources: { db: { url } },
        log: ['error']
    });

    try {
        await prisma.$connect();
        console.log(`✅ Success! Connected on port ${port}`);
        await prisma.$disconnect();
        return true;
    } catch (e: any) {
        console.log(`❌ Failed on port ${port}:`);
        console.log(`   Error: ${e.message?.split('\n')[0]}`);
        return false;
    }
}

async function main() {
    console.log('🔍 Starting Pooler Diagnostics...');

    // 1. DNS Resolution
    try {
        console.log(`\nChecking DNS for ${HOST}...`);
        const ipv4 = await resolve4(HOST).catch(() => []);
        console.log(`   IPv4: ${ipv4.join(', ') || 'None'}`);
    } catch (e) {
        console.error('   DNS Check failed:', e);
    }

    // 2. Test Ports
    await testConnection(5432);
    await testConnection(6543);
}

main();
