import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying SubvariableEntry persistence...');

    const entries = await prisma.habitEntry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            subvariableEntries: {
                include: {
                    subvariable: true
                }
            },
            habit: true,
            user: true
        }
    });

    console.log(`Found ${entries.length} recent habit entries.`);

    for (const entry of entries) {
        console.log(`\nEntry ID: ${entry.id}`);
        console.log(`Habit: ${entry.habit.name} (${entry.habit.id})`);
        console.log(`User: ${entry.user.email}`);
        console.log(`Timestamp: ${entry.timestamp}`);
        console.log(`LogicalDate: ${entry.logicalDate}`);
        console.log(`Subvariable Entries Count: ${entry.subvariableEntries.length}`);

        if (entry.subvariableEntries.length > 0) {
            entry.subvariableEntries.forEach(sub => {
                console.log(`  - Subvariable: ${sub.subvariable.name} (${sub.subvariableId})`);
                console.log(`    Value: ${sub.numericValue}`);
                console.log(`    Raw: ${sub.rawValue}`);
            });
        } else {
            console.log('  No subvariable entries found for this habit entry.');
            const habitSubs = await prisma.subvariable.findMany({
                where: { habitId: entry.habitId, active: true }
            });
            console.log(`  (Habit has ${habitSubs.length} active subvariables that could have been logged)`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
