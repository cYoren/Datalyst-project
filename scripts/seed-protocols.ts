/**
 * Seed Protocols and API Keys
 * 
 * Run with: npx ts-node --project tsconfig.json scripts/seed-protocols.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding protocols and API keys...');

    // Create sample protocols
    const protocols = [
        {
            slug: 'magnesium-sleep-v1',
            name: 'Magnesium for Sleep Quality',
            description: 'Test whether nightly magnesium supplementation improves subjective sleep quality.',
            version: '1.0',
            independentTemplate: {
                name: 'Magnesium (400mg)',
                type: 'BOOLEAN',
                unit: null,
            },
            dependentTemplate: {
                name: 'Sleep Quality',
                type: 'SCALE_0_10',
                unit: 'points',
            },
            recommendedDuration: 14,
            recommendedWashout: 2,
            isPublic: true,
        },
        {
            slug: 'caffeine-focus-v1',
            name: 'Caffeine Timing for Focus',
            description: 'Test whether delaying morning caffeine by 90 minutes improves afternoon focus.',
            version: '1.0',
            independentTemplate: {
                name: 'Delayed Caffeine',
                type: 'BOOLEAN',
                unit: null,
            },
            dependentTemplate: {
                name: 'Afternoon Focus',
                type: 'SCALE_0_10',
                unit: 'points',
            },
            recommendedDuration: 14,
            recommendedWashout: 1,
            isPublic: true,
        },
        {
            slug: 'cold-shower-energy-v1',
            name: 'Cold Exposure for Energy',
            description: 'Test whether ending showers with 30 seconds of cold water increases morning energy.',
            version: '1.0',
            independentTemplate: {
                name: 'Cold Shower (30s)',
                type: 'BOOLEAN',
                unit: null,
            },
            dependentTemplate: {
                name: 'Morning Energy',
                type: 'SCALE_0_10',
                unit: 'points',
            },
            recommendedDuration: 14,
            recommendedWashout: 1,
            isPublic: true,
        },
    ];

    for (const protocol of protocols) {
        await prisma.protocol.upsert({
            where: { slug: protocol.slug },
            update: protocol,
            create: protocol,
        });
        console.log(`  ✅ Protocol: ${protocol.name}`);
    }

    console.log('\n📋 Available protocols:');
    const allProtocols = await prisma.protocol.findMany({ select: { slug: true, name: true } });
    allProtocols.forEach(p => console.log(`  - ${p.slug}: ${p.name}`));

    console.log('\n🔑 To create an API key, use the dashboard or run:');
    console.log('  await prisma.apiKey.create({');
    console.log('    data: {');
    console.log('      key: "sk_test_" + crypto.randomUUID(),');
    console.log('      name: "My Agent",');
    console.log('      userId: "<your-user-id>",');
    console.log('    },');
    console.log('  });');

    console.log('\n✨ Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
